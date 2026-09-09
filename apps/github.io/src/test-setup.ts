function escapeCssIdentifier(value: string) {
  const characters = Array.from(String(value));

  return characters
    .map((character, index) => {
      const codePoint = character.codePointAt(0) ?? 0;

      if (codePoint === 0) {
        return '\uFFFD';
      }

      if (
        (codePoint >= 1 && codePoint <= 31) ||
        codePoint === 127 ||
        (index === 0 && codePoint >= 48 && codePoint <= 57) ||
        (index === 1 &&
          codePoint >= 48 &&
          codePoint <= 57 &&
          characters[0] === '-')
      ) {
        return `\\${codePoint.toString(16)} `;
      }

      if (
        codePoint >= 128 ||
        character === '-' ||
        character === '_' ||
        (codePoint >= 48 && codePoint <= 57) ||
        (codePoint >= 65 && codePoint <= 90) ||
        (codePoint >= 97 && codePoint <= 122)
      ) {
        return character;
      }

      return `\\${character}`;
    })
    .join('');
}

const css = globalThis.CSS ?? ({} as typeof CSS);

if (globalThis.CSS == null) {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    value: css,
  });
}

if (typeof css.escape !== 'function') {
  Object.defineProperty(css, 'escape', {
    configurable: true,
    value: escapeCssIdentifier,
  });
}
