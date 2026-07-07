const skipJsonWhitespace = (code: string, startIndex: number) => {
  let index = startIndex;

  while (/\s/.test(code[index] ?? '')) {
    index += 1;
  }

  return index;
};

const readJsonString = (code: string, startIndex: number) => {
  let escaped = false;

  for (let index = startIndex + 1; index < code.length; index += 1) {
    const character = code[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      continue;
    }

    if (character === '"') {
      try {
        return {
          nextIndex: index + 1,
          value: JSON.parse(code.slice(startIndex, index + 1)) as string,
        };
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
};

export const hasDuplicateJsonObjectKeys = (code: string) => {
  const stack: Array<
    { expectingKey: boolean; keys: Set<string>; type: 'object' } | { type: 'array' }
  > = [];

  for (let index = 0; index < code.length; index += 1) {
    const character = code[index];

    if (/\s/.test(character)) {
      continue;
    }

    if (character === '"') {
      const jsonString = readJsonString(code, index);

      if (jsonString === undefined) {
        return false;
      }

      const context = stack.at(-1);
      const nextIndex = skipJsonWhitespace(code, jsonString.nextIndex);

      if (context?.type === 'object' && context.expectingKey && code[nextIndex] === ':') {
        if (context.keys.has(jsonString.value)) {
          return true;
        }

        context.keys.add(jsonString.value);
        context.expectingKey = false;
      }

      index = jsonString.nextIndex - 1;
      continue;
    }

    if (character === '{') {
      stack.push({ expectingKey: true, keys: new Set(), type: 'object' });
      continue;
    }

    if (character === '[') {
      stack.push({ type: 'array' });
      continue;
    }

    if (character === '}' || character === ']') {
      stack.pop();
      continue;
    }

    if (character === ',') {
      const context = stack.at(-1);

      if (context?.type === 'object') {
        context.expectingKey = true;
      }
    }
  }

  return false;
};

export const formatJsonPreservingDuplicateKeys = (code: string) => {
  if (hasDuplicateJsonObjectKeys(code)) {
    return code;
  }

  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch {
    return code;
  }
};
