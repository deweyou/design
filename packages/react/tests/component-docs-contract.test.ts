import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../../..');

const readPackageExports = () => {
  const packageJson = JSON.parse(
    readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'),
  ) as {
    exports: Record<string, unknown>;
  };

  return Object.keys(packageJson.exports).filter(
    (entry) => entry !== '.' && entry !== './package.json' && entry !== './style.css',
  );
};

describe('component docs contract', () => {
  it('documents every public react component subpath export', () => {
    const docs = readFileSync(resolve(root, 'docs/design/components.md'), 'utf8');

    for (const exportPath of readPackageExports()) {
      expect(docs).toContain(`@deweyou-design/react${exportPath.slice(1)}`);
    }
  });

  it('documents AI-facing composition and accessibility contracts', () => {
    const docs = readFileSync(resolve(root, 'docs/design/components.md'), 'utf8');

    expect(docs).toContain('## Import Matrix');
    expect(docs).toContain('## Composition Trees');
    expect(docs).toContain('## Accessibility Contracts');
    expect(docs).toContain('Dialog.Root');
    expect(docs).toContain('Select.Trigger');
    expect(docs).toContain('Field.Label');
    expect(docs).toContain('showControls={false}');
    expect(docs).toContain('showFocusRing={false}');
  });
});
