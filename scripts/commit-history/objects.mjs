const SIGNATURE_HEADERS = new Set(['gpgsig', 'gpgsig-sha256']);

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
  { parentMap, replacementMessage, signaturePolicy },
) {
  if (!(parentMap instanceof Map)) fail('parentMap must be a Map');
  if (replacementMessage !== null && !Buffer.isBuffer(replacementMessage)) {
    fail('replacementMessage must be a Buffer or null');
  }
  if (signaturePolicy !== 'reject') {
    fail(`unsupported signature policy ${String(signaturePolicy)}`);
  }

  const parsed = parseCommit(raw);
  let parentsChanged = false;
  const headers = parsed.headers.map((header) => {
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
  if (
    changed &&
    parsed.headers.some(({ name }) => SIGNATURE_HEADERS.has(name))
  ) {
    fail('refusing to rewrite a signature-bearing commit');
  }

  return changed ? serializeCommit(headers, message) : raw;
}
