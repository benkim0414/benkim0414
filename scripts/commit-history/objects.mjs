import { createHash } from 'node:crypto';

const SIGNATURE_HEADERS = new Set(['gpgsig', 'gpgsig-sha256']);
const SIGNATURE_POLICIES = new Set(['reject', 'remove-approved']);

function fail(message) {
  throw new Error(message);
}

function splitHeaderLines(headerBytes) {
  const lines = [];
  let lineStart = 0;

  while (lineStart <= headerBytes.length) {
    const lineEnd = headerBytes.indexOf(0x0a, lineStart);
    if (lineEnd === -1) {
      lines.push(headerBytes.subarray(lineStart));
      break;
    }
    lines.push(headerBytes.subarray(lineStart, lineEnd));
    lineStart = lineEnd + 1;
  }

  return lines;
}

export function parseCommit(raw) {
  if (!Buffer.isBuffer(raw)) fail('commit object must be a Buffer');
  const separator = raw.indexOf('\n\n');
  if (separator === -1) {
    fail('malformed commit object: missing header separator');
  }

  const headers = [];
  for (const line of splitHeaderLines(raw.subarray(0, separator))) {
    if (line[0] === 0x20) {
      if (headers.length === 0) {
        fail('malformed commit object: orphan continuation');
      }
      headers.at(-1).value = Buffer.concat([
        headers.at(-1).value,
        Buffer.from('\n'),
        line,
      ]);
      continue;
    }

    const space = line.indexOf(0x20);
    if (space <= 0) fail('malformed commit object: invalid header');
    const nameBytes = line.subarray(0, space);
    const name = nameBytes.toString('ascii');
    if (
      !Buffer.from(name, 'ascii').equals(nameBytes) ||
      !/^[A-Za-z0-9-]+$/.test(name)
    ) {
      fail('malformed commit object: invalid header name');
    }
    headers.push({ name, value: line.subarray(space + 1) });
  }

  return { headers, message: raw.subarray(separator + 2) };
}

function serializeCommit(headers, message) {
  const records = headers.map(({ name, value }) =>
    Buffer.concat([Buffer.from(`${name} `, 'ascii'), value]),
  );
  return Buffer.concat([
    ...records.flatMap((record) => [record, Buffer.from('\n')]),
    Buffer.from('\n'),
    message,
  ]);
}

export function signatureHeaderRecord({ name, value }) {
  return Buffer.concat([Buffer.from(`${name} `, 'ascii'), value]);
}

export function isSignatureHeader(name) {
  return SIGNATURE_HEADERS.has(name);
}

export function signatureHeaderSha256(header) {
  return createHash('sha256')
    .update(signatureHeaderRecord(header))
    .digest('hex');
}

export function signatureApprovalKey({ oid, header, sha256 }) {
  return `${oid}\0${header}\0${sha256}`;
}

export function validateSignatureAllowlist(
  signaturePolicy,
  signatureAllowlist = [],
  objectFormat = null,
) {
  if (!SIGNATURE_POLICIES.has(signaturePolicy)) {
    fail(`unsupported signature policy ${String(signaturePolicy)}`);
  }
  if (!Array.isArray(signatureAllowlist)) {
    fail('signature allowlist must be an array');
  }
  if (signaturePolicy === 'reject') {
    if (signatureAllowlist.length !== 0) {
      fail('reject signature policy cannot include signature approvals');
    }
    return [];
  }
  if (signatureAllowlist.length === 0) {
    fail('remove-approved signature policy requires signature approvals');
  }

  const oidPattern =
    objectFormat === 'sha1'
      ? /^[0-9a-f]{40}$/
      : objectFormat === 'sha256'
        ? /^[0-9a-f]{64}$/
        : /^[0-9a-f]{40}$|^[0-9a-f]{64}$/;
  const seen = new Set();
  return signatureAllowlist.map((approval, index) => {
    if (
      approval === null ||
      typeof approval !== 'object' ||
      Array.isArray(approval) ||
      Object.keys(approval).sort().join('\0') !== 'header\0oid\0sha256'
    ) {
      fail(`signature approval[${index}] has missing or unknown fields`);
    }
    if (typeof approval.oid !== 'string' || !oidPattern.test(approval.oid)) {
      fail(`signature approval[${index}].oid must be a full commit OID`);
    }
    if (!isSignatureHeader(approval.header)) {
      fail(
        `signature approval[${index}] names unknown header ${String(approval.header)}`,
      );
    }
    if (
      typeof approval.sha256 !== 'string' ||
      !/^[0-9a-f]{64}$/.test(approval.sha256)
    ) {
      fail(`signature approval[${index}].sha256 must be a SHA-256 digest`);
    }
    const key = signatureApprovalKey(approval);
    if (seen.has(key)) fail(`duplicate signature approval ${key}`);
    seen.add(key);
    return approval;
  });
}

function mappedParent(parentMap, value) {
  const oldOid = value.toString('ascii');
  if (!/^[0-9a-f]{40}$|^[0-9a-f]{64}$/.test(oldOid)) {
    fail(`malformed parent OID ${oldOid}`);
  }
  if (!parentMap.has(oldOid)) fail(`missing parent mapping for ${oldOid}`);
  const newOid = parentMap.get(oldOid);
  if (
    typeof newOid !== 'string' ||
    newOid.length !== oldOid.length ||
    !/^[0-9a-f]+$/.test(newOid)
  ) {
    fail(`invalid mapped parent OID for ${oldOid}`);
  }
  return { oldOid, newOid, value: Buffer.from(newOid, 'ascii') };
}

export function transformCommit(
  raw,
  {
    originalOid,
    parentMap,
    replacementMessage,
    signaturePolicy,
    signatureAllowlist = [],
    onSignatureRemoval = null,
  },
) {
  if (!(parentMap instanceof Map)) fail('parentMap must be a Map');
  if (replacementMessage !== null && !Buffer.isBuffer(replacementMessage)) {
    fail('replacementMessage must be a Buffer or null');
  }
  const inferredObjectFormat =
    typeof originalOid === 'string' && originalOid.length === 40
      ? 'sha1'
      : typeof originalOid === 'string' && originalOid.length === 64
        ? 'sha256'
        : null;
  const approvals = validateSignatureAllowlist(
    signaturePolicy,
    signatureAllowlist,
    inferredObjectFormat,
  );
  if (signaturePolicy === 'remove-approved' && inferredObjectFormat === null) {
    fail('originalOid must be a full commit OID for signature removal');
  }
  if (onSignatureRemoval !== null && typeof onSignatureRemoval !== 'function') {
    fail('onSignatureRemoval must be a function or null');
  }

  const parsed = parseCommit(raw);
  let parentsChanged = false;
  let headers = parsed.headers.map((header) => {
    if (header.name !== 'parent') return header;
    const mapped = mappedParent(parentMap, header.value);
    if (mapped.oldOid !== mapped.newOid) parentsChanged = true;
    return { name: header.name, value: mapped.value };
  });
  const message = replacementMessage ?? parsed.message;
  const messageChanged = !message.equals(parsed.message);
  const changed = parentsChanged || messageChanged;

  if (
    parentsChanged &&
    parsed.headers.some(({ name }) => name === 'mergetag')
  ) {
    fail('refusing to remap a parent bound by an embedded mergetag');
  }
  if (changed && parsed.headers.some(({ name }) => isSignatureHeader(name))) {
    if (signaturePolicy === 'reject') {
      fail('refusing to rewrite a signature-bearing commit');
    }
    const approvalsForCommit = approvals.filter(
      (approval) => approval.oid === originalOid,
    );
    const used = new Set();
    headers = headers.filter((header) => {
      if (!isSignatureHeader(header.name)) return true;
      const candidate = {
        oid: originalOid,
        header: header.name,
        sha256: signatureHeaderSha256(header),
      };
      const key = signatureApprovalKey(candidate);
      if (
        !approvalsForCommit.some(
          (approval) => signatureApprovalKey(approval) === key,
        ) ||
        used.has(key)
      ) {
        fail(
          `refusing to remove ${header.name} from ${originalOid} without exact signature approval`,
        );
      }
      used.add(key);
      onSignatureRemoval?.(candidate);
      return false;
    });
    const unused = approvalsForCommit.find(
      (approval) => !used.has(signatureApprovalKey(approval)),
    );
    if (unused) {
      fail(`unused signature approval ${signatureApprovalKey(unused)}`);
    }
  } else if (approvals.some((approval) => approval.oid === originalOid)) {
    fail(`unused signature approval for unchanged commit ${originalOid}`);
  }

  return changed ? serializeCommit(headers, message) : raw;
}
