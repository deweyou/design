import {
  AlertCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  Menu2Icon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from '@deweyou-design/react-icons';

const iconExamples = [
  { name: 'plus', Component: PlusIcon },
  { name: 'check', Component: CheckIcon },
  { name: 'chevron-left', Component: ChevronLeftIcon },
  { name: 'chevron-right', Component: ChevronRightIcon },
  { name: 'x', Component: XIcon },
  { name: 'alert-circle', Component: AlertCircleIcon },
  { name: 'info', Component: InfoIcon },
  { name: 'menu-2', Component: Menu2Icon },
  { name: 'search', Component: SearchIcon },
] as const;

export const IconGuidance = () => {
  return (
    <section className="icon-layout">
      <div className="icon-panel">
        <p className="eyebrow">Official icon package</p>
        <h2>Tabler Icons wrapped with square caps and miter joins</h2>
        <p className="hero-copy">
          The `@deweyou-design/react-icons` package exports named icon components built on top of
          Tabler Icons (MIT). All icons use `currentColor`, `strokeLinecap="square"`, and
          `strokeLinejoin="miter"` to match the rect-first design language. Import named exports
          directly — no registry lookup, no lazy loading.
        </p>
        <div className="icon-contract">
          <div>
            <strong>Props</strong>
            <code>aria-label | className | size | stroke | style</code>
          </div>
          <div>
            <strong>Size</strong>
            <code>number (px) | CSS string — defaults to 1em</code>
          </div>
          <div>
            <strong>Delivery</strong>
            <code>synchronous named exports</code>
          </div>
        </div>
      </div>
      <div className="icon-panel">
        <h2>Foundational icon set</h2>
        <div className="icon-grid">
          {iconExamples.map(({ Component, name }) => (
            <article key={name} className="icon-card">
              <Component size={24} />
              <strong>{name}</strong>
              <code>{name}</code>
            </article>
          ))}
        </div>
      </div>
      <div className="icon-panel">
        <h2>Accessibility and sizing</h2>
        <div className="icon-usage-grid">
          <article className="icon-usage-card">
            <h3>Unlabeled usage</h3>
            <Menu2Icon size={24} />
            <p>
              Without `aria-label`, icons are treated as decorative and hidden from assistive
              technology via `aria-hidden="true"`.
            </p>
          </article>
          <article className="icon-usage-card">
            <h3>Labeled usage</h3>
            <InfoIcon aria-label="Information" size={24} />
            <p>
              Provide `aria-label` whenever the icon carries meaning that surrounding text does not
              already provide. The icon renders with `role="img"`.
            </p>
          </article>
          <article className="icon-usage-card">
            <h3>Named import usage</h3>
            <code>{'<SearchIcon size={18} />'}</code>
            <p>
              Import named icons directly from `@deweyou-design/react-icons`. Tree-shaking works
              automatically and icons render synchronously without a loading state.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};
