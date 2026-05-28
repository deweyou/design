import { CodeBlock, Text } from '@deweyou-design/react';

import styles from './ai.module.less';

const SKILL_INSTALL_COMMAND =
  'npx skills add https://github.com/deweyou/design/tree/main/skills/deweyou-design-components -g -a codex';

const MCP_CLIENT_CONFIG = `{
  "mcpServers": {
    "deweyou-design": {
      "command": "npx",
      "args": ["-y", "@deweyou-design/mcp@latest"]
    }
  }
}`;

const AI_SURFACES = [
  {
    body: 'Use the website-hosted text file when an external model only needs a compact, crawlable overview of Deweyou Design packages, source paths, and public entrypoints.',
    command: 'https://design.deweyou.me/llms.txt',
    link: '/llms.txt',
    meta: 'website · public URL',
    number: '01',
    title: 'llms.txt',
  },
  {
    body: 'Add the stdio MCP server to an MCP-capable client when an agent should query structured component, style, and icon metadata through tools instead of reading static documentation.',
    command: MCP_CLIENT_CONFIG,
    link: undefined,
    meta: 'client config · stdio server',
    number: '02',
    title: 'MCP',
  },
  {
    body: 'Install the skill when an agent needs reusable workflow guidance for branded Deweyou Design UI generation. The skill is independent from MCP and can optionally tell the agent to use MCP when available.',
    command: SKILL_INSTALL_COMMAND,
    link: undefined,
    meta: 'skill · local instructions',
    number: '03',
    title: 'Skill',
  },
] as const;

export const AiPage = () => (
  <main className={styles.page}>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>AI · Integration Surfaces</p>
      <h1>AI</h1>
      <Text className={styles.lead} variant="body">
        Deweyou Design exposes three separate integration surfaces: `llms.txt` for website context,
        MCP for structured runtime queries, and Skill for reusable agent workflow guidance.
      </Text>
    </section>

    <section className={styles.section}>
      <header className={styles.sectionHead}>
        <span>Overview</span>
        <h2>Usage Model</h2>
        <p>choose by integration surface</p>
      </header>
      <div className={styles.usageGrid}>
        {AI_SURFACES.map((surface) => (
          <article key={surface.title}>
            <span>{surface.number}</span>
            <strong>{surface.title}</strong>
            <p>{surface.meta}</p>
          </article>
        ))}
      </div>
    </section>

    {AI_SURFACES.map((surface) => (
      <section className={styles.section} key={surface.title}>
        <header className={styles.sectionHead}>
          <span>{surface.number}</span>
          <h2>{surface.title}</h2>
          <p>{surface.meta}</p>
        </header>
        <div className={styles.surfaceBody}>
          <Text variant="body">{surface.body}</Text>
          {surface.link ? (
            <a className={styles.textLink} href={surface.link}>
              {surface.link}
            </a>
          ) : null}
          {surface.title === 'llms.txt' ? (
            <CodeBlock language="text">{surface.command}</CodeBlock>
          ) : null}
          {surface.title === 'MCP' ? (
            <CodeBlock language="json">{surface.command}</CodeBlock>
          ) : null}
          {surface.title === 'Skill' ? (
            <div className={styles.commandList} aria-label="Skill install command">
              <code>{SKILL_INSTALL_COMMAND}</code>
            </div>
          ) : null}
        </div>
      </section>
    ))}
  </main>
);
