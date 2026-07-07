import { expect, test } from 'vite-plus/test';

import { formatJsonPreservingDuplicateKeys, hasDuplicateJsonObjectKeys } from './json-format';

test('hasDuplicateJsonObjectKeys detects duplicate keys within the same object', () => {
  expect(hasDuplicateJsonObjectKeys('{"name":"first","name":"last"}')).toBe(true);
  expect(hasDuplicateJsonObjectKeys('{"nested":{"name":"first","name":"last"}}')).toBe(true);
  expect(hasDuplicateJsonObjectKeys('{"name":"root","nested":{"name":"nested"}}')).toBe(false);
  expect(hasDuplicateJsonObjectKeys('{"name":"value","items":[{"name":"value"}]}')).toBe(false);
});

test('formatJsonPreservingDuplicateKeys avoids lossy duplicate-key formatting', () => {
  const duplicateJson = '{"name":"first","name":"last"}';

  expect(formatJsonPreservingDuplicateKeys(duplicateJson)).toBe(duplicateJson);
  expect(formatJsonPreservingDuplicateKeys('{"name":"Deweyou","enabled":true}')).toBe(
    '{\n  "name": "Deweyou",\n  "enabled": true\n}',
  );
});
