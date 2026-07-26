import { isMap, isScalar, parseDocument, type Document } from 'yaml';

import type { FrontmatterRecord, FrontmatterValue } from './index.js';

export type ParsedFrontmatterSource = {
  value?: FrontmatterRecord;
  error?: string;
};

export type MarkdownFrontmatterBlock = ParsedFrontmatterSource & {
  raw: string;
  source: string;
};

export type ParsedMarkdownFrontmatter = {
  body: string;
  frontmatter?: MarkdownFrontmatterBlock;
};

export type UpdatedFrontmatterSource = ParsedFrontmatterSource & {
  source: string;
};

type ParsedYamlDocument = {
  document?: Document;
  error?: string;
  value?: FrontmatterRecord;
};

const createYamlError = (message: string) => `Invalid frontmatter YAML: ${message}`;

const isFrontmatterValue = (value: unknown, ancestors: Set<object>): value is FrontmatterValue => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return true;
  }

  if (typeof value !== 'object') {
    return false;
  }

  if (ancestors.has(value)) {
    return false;
  }

  if (!Array.isArray(value)) {
    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
      return false;
    }
  }

  ancestors.add(value);
  const isValid = Array.isArray(value)
    ? value.every((entry) => isFrontmatterValue(entry, ancestors))
    : Object.entries(value).every(
        ([key, entry]) => key.length > 0 && isFrontmatterValue(entry, ancestors),
      );
  ancestors.delete(value);

  return isValid;
};

const parseYamlDocument = (source: string): ParsedYamlDocument => {
  const document = parseDocument(source, {
    keepSourceTokens: true,
    prettyErrors: true,
    uniqueKeys: true,
  });
  const diagnostic = document.errors[0] ?? document.warnings[0];

  if (diagnostic) {
    return { error: createYamlError(diagnostic.message) };
  }

  if (document.contents === null) {
    return { document, value: {} };
  }

  if (!isMap(document.contents)) {
    return { error: createYamlError('the root value must be a mapping.') };
  }

  try {
    const value = document.toJS({ maxAliasCount: 100 }) as unknown;

    if (!isFrontmatterValue(value, new Set()) || Array.isArray(value) || value === null) {
      return {
        error: createYamlError(
          'values must use strings, finite numbers, booleans, null, arrays, or string-keyed mappings.',
        ),
      };
    }

    return { document, value: value as FrontmatterRecord };
  } catch (error) {
    return {
      error: createYamlError(error instanceof Error ? error.message : 'the value cannot be read.'),
    };
  }
};

export const parseFrontmatterSource = (source: string): ParsedFrontmatterSource => {
  const { error, value } = parseYamlDocument(source);

  return { error, value };
};

const findLeadingFrontmatter = (markdown: string) => {
  const contentStart = markdown.startsWith('\uFEFF') ? 1 : 0;
  const openingLineEnd = markdown.indexOf('\n', contentStart);

  if (openingLineEnd === -1) {
    return undefined;
  }

  const openingLine = markdown.slice(contentStart, openingLineEnd).replace(/\r$/, '');

  if (!/^---[\t ]*$/.test(openingLine)) {
    return undefined;
  }

  let lineStart = openingLineEnd + 1;

  while (lineStart <= markdown.length) {
    const nextLineEnd = markdown.indexOf('\n', lineStart);
    const lineEnd = nextLineEnd === -1 ? markdown.length : nextLineEnd;
    const line = markdown.slice(lineStart, lineEnd).replace(/\r$/, '');

    if (/^---[\t ]*$/.test(line)) {
      return {
        bodyStart: nextLineEnd === -1 ? markdown.length : nextLineEnd + 1,
        closingLineEnd: lineEnd,
        contentStart,
        openingLineEnd,
        sourceEnd: lineStart,
      };
    }

    if (nextLineEnd === -1) {
      break;
    }

    lineStart = nextLineEnd + 1;
  }

  return undefined;
};

export const parseMarkdownFrontmatter = (markdown: string): ParsedMarkdownFrontmatter => {
  const range = findLeadingFrontmatter(markdown);

  if (!range) {
    return { body: markdown };
  }

  const source = markdown.slice(range.openingLineEnd + 1, range.sourceEnd);
  const parsed = parseFrontmatterSource(source);

  return {
    body: markdown.slice(range.bodyStart),
    frontmatter: {
      ...parsed,
      raw: markdown.slice(range.contentStart, range.closingLineEnd),
      source,
    },
  };
};

export const serializeFrontmatterBlock = (source: string) => {
  const lineEnding = source.includes('\r\n') ? '\r\n' : '\n';
  const sourceWithLineEnding =
    source.length === 0 || source.endsWith('\n') ? source : `${source}${lineEnding}`;

  return `---${lineEnding}${sourceWithLineEnding}---`;
};

export const updateFrontmatterSource = (
  source: string,
  path: readonly (string | number)[],
  value: FrontmatterValue,
): UpdatedFrontmatterSource => {
  const parsed = parseYamlDocument(source);

  if (!parsed.document || parsed.error) {
    return { error: parsed.error ?? createYamlError('the document cannot be updated.'), source };
  }

  try {
    if (parsed.document.contents === null) {
      parsed.document.contents = parsed.document.createNode({});
    }

    parsed.document.setIn([...path], value);
    const nextSource = parsed.document.toString({ lineWidth: 0 });
    const nextParsed = parseFrontmatterSource(nextSource);

    return { ...nextParsed, source: nextSource };
  } catch (error) {
    return {
      error: createYamlError(error instanceof Error ? error.message : 'the update failed.'),
      source,
    };
  }
};

export const deleteFrontmatterPath = (
  source: string,
  path: readonly (string | number)[],
): UpdatedFrontmatterSource => {
  const parsed = parseYamlDocument(source);

  if (!parsed.document || parsed.error) {
    return { error: parsed.error ?? createYamlError('the document cannot be updated.'), source };
  }

  try {
    if (!parsed.document.deleteIn([...path])) {
      return { error: createYamlError('the property does not exist.'), source };
    }

    const nextSource = parsed.document.toString({ lineWidth: 0 });
    const nextParsed = parseFrontmatterSource(nextSource);

    return { ...nextParsed, source: nextSource };
  } catch (error) {
    return {
      error: createYamlError(error instanceof Error ? error.message : 'the update failed.'),
      source,
    };
  }
};

export const renameFrontmatterKey = (
  source: string,
  key: string,
  nextKey: string,
): UpdatedFrontmatterSource => {
  const parsed = parseYamlDocument(source);

  if (!parsed.document || parsed.error || !isMap(parsed.document.contents)) {
    return { error: parsed.error ?? createYamlError('the document cannot be updated.'), source };
  }

  if (key === nextKey) {
    return { ...parsed, source };
  }

  const propertyPair = parsed.document.contents.items.find(
    (pair) => isScalar(pair.key) && pair.key.value === key,
  );
  const duplicatePair = parsed.document.contents.items.find(
    (pair) => isScalar(pair.key) && pair.key.value === nextKey,
  );

  if (!propertyPair || !isScalar(propertyPair.key)) {
    return { error: createYamlError(`the property ${key} does not exist.`), source };
  }

  if (duplicatePair) {
    return {
      error: createYamlError(`a property named ${nextKey} already exists.`),
      source,
    };
  }

  try {
    propertyPair.key.value = nextKey;
    const nextSource = parsed.document.toString({ lineWidth: 0 });
    const nextParsed = parseFrontmatterSource(nextSource);

    return { ...nextParsed, source: nextSource };
  } catch (error) {
    return {
      error: createYamlError(error instanceof Error ? error.message : 'the update failed.'),
      source,
    };
  }
};
