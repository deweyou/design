import { AddIcon } from '@deweyou-design/react-icons/add';
import { CheckIcon } from '@deweyou-design/react-icons/check';
import { ChevronLeftIcon } from '@deweyou-design/react-icons/chevron-left';
import { ChevronRightIcon } from '@deweyou-design/react-icons/chevron-right';
import { CloseIcon } from '@deweyou-design/react-icons/close';
import { ErrorCircleIcon } from '@deweyou-design/react-icons/error-circle';
import { InfoCircleIcon } from '@deweyou-design/react-icons/info-circle';
import { MenuIcon } from '@deweyou-design/react-icons/menu';
import { SearchIcon } from '@deweyou-design/react-icons/search';

const iconExamples = [
  { name: 'add', Component: AddIcon },
  { name: 'check', Component: CheckIcon },
  { name: 'chevron-left', Component: ChevronLeftIcon },
  { name: 'chevron-right', Component: ChevronRightIcon },
  { name: 'close', Component: CloseIcon },
  { name: 'error-circle', Component: ErrorCircleIcon },
  { name: 'info-circle', Component: InfoCircleIcon },
  { name: 'menu', Component: MenuIcon },
  { name: 'search', Component: SearchIcon },
] as const;

export const IconGuidance = () => {
  return (
    <section className="icon-layout">
      <div className="icon-panel">
        <p className="eyebrow">Official icon package</p>
        <h2>Curated TDesign-backed icons, Deweyou-owned API</h2>
        <p className="hero-copy">
          The `@deweyou-design/react-icons` package keeps the root entry focused on the generic
          `Icon` component and related types, while direct icon components ship from subpaths like
          `@deweyou-design/react-icons/search`. SVG assets come from `tdesign-icons-svg` under MIT,
          but naming, accessibility, and error behavior stay under Deweyou UI control.
        </p>
        <div className="icon-contract">
          <div>
            <strong>Props</strong>
            <code>name | className | style | label | size</code>
          </div>
          <div>
            <strong>Sizes</strong>
            <code>extra-small | small | medium | large | extra-large | number</code>
          </div>
          <div>
            <strong>Delivery</strong>
            <code>subpath exports + lazy Icon</code>
          </div>
        </div>
      </div>
      <div className="icon-panel">
        <h2>Foundational icon set</h2>
        <div className="icon-grid">
          {iconExamples.map(({ Component, name }) => (
            <article key={name} className="icon-card">
              <Component size="large" />
              <strong>{name}</strong>
              <code>{Component.displayName ?? 'Icon'}</code>
            </article>
          ))}
        </div>
      </div>
      <div className="icon-panel">
        <h2>Accessibility and sizing</h2>
        <div className="icon-usage-grid">
          <article className="icon-usage-card">
            <h3>Unlabeled usage</h3>
            <MenuIcon size="large" />
            <p>
              Without `label`, icons are treated as decorative and hidden from assistive technology.
            </p>
          </article>
          <article className="icon-usage-card">
            <h3>Labeled usage</h3>
            <InfoCircleIcon label="Information" size="large" />
            <p>
              Provide `label` whenever the icon carries meaning that surrounding text does not
              already provide.
            </p>
          </article>
          <article className="icon-usage-card">
            <h3>Dynamic lookup</h3>
            <code>{'<Icon name="search" size={18} />'}</code>
            <p>
              Use the generic `Icon` component only when the icon name comes from configuration or
              registry-driven UI. For normal component code, prefer subpath imports so consumer
              bundles can tree-shake unused icons and render immediately.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};
