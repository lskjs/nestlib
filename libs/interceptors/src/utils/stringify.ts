// import safeStringify from 'safe-stringify';

function safeStringifyReplacer(seen: any) {
  return function (key: any, initValue: any) {
    let value = initValue;
    // Handle objects with a custom `.toJSON()` method.
    if (typeof value?.toJSON === 'function') {
      value = value.toJSON();
    }

    if (!(value !== null && typeof value === 'object')) {
      return value;
    }

    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    const newValue: Record<string, any> = Array.isArray(value) ? [] : {};

    // eslint-disable-next-line no-restricted-syntax
    for (const [key2, value2] of Object.entries(value)) {
      newValue[key2] = safeStringifyReplacer(seen)(key2, value2);
    }

    seen.delete(value);

    return newValue;
  };
}

export default function safeStringify(
  object: any,
  { indentation }: { indentation?: string | number } = {},
) {
  const seen = new WeakSet();
  return JSON.stringify(object, safeStringifyReplacer(seen), indentation);
}

export function stringify(data: any, space?: string | number): string {
  return safeStringify(data, {
    indentation: space ? Number(space) : '',
  });
  //   if (typeof data === 'undefined') return 'null';
  //   if (typeof data === 'function') return 'null';
  //   if (typeof data === 'string') return data;
  //   return JSON.stringify(data, null, space);
}
