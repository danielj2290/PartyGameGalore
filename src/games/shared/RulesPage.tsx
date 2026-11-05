import { Fragment, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { LightReflections } from '../../components/LightReflections/LightReflections';
import styles from './RulesPage.module.css';

type Entry = [title: string, text: ReactNode];
export interface RulesSection { heading: string; intro?: ReactNode; items: Entry[] }
export interface RulesContent {
  name: string;
  headerTagline: string;
  footer: string;
  eyebrow: string;
  tagline: string;
  lede: string;
  ruleset?: ReactNode;
  facts: Entry[];
  setup: ReactNode[];
  steps: Entry[];
  sections: RulesSection[];
  example?: { heading: string; body: ReactNode };
  win: ReactNode[];
  variations?: RulesSection;
  sources: { label: string; href: string }[];
}

// Informational rules page for games whose gameplay is not built yet.
export function RulesPage({ content }: { content: RulesContent }) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = `${content.name} — Party Games Galore`; window.scrollTo(0, 0);
    main.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [content.name]);
  return <div className={styles.page}>
    <LightReflections />
    <header className={styles.header}>
      <Link className={styles.brand} to="/" aria-label="Party Games Galore home"><span><Icon name="burst" /></span> PGG.</Link>
      <span className={styles.headerLabel}>{content.name.toUpperCase()} <span>· {content.headerTagline}</span></span>
      <Link className={styles.textLink} to="/">Back to home <Icon name="arrowUpRight" /></Link>
    </header>
    <main ref={main} className={styles.main}><article className={styles.intro}>
      <p className={styles.eyebrow}>{content.eyebrow}</p>
      <h1 tabIndex={-1}>{content.name}<br /><em>{content.tagline}</em></h1>
      <p className={styles.lede}>{content.lede}</p>
      {content.ruleset && <p className={styles.ruleset}>{content.ruleset}</p>}
      <dl className={styles.facts}>{content.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>

      <section className={styles.section} aria-labelledby="setup">
        <h2 id="setup" className={styles.sectionHeading}>Setup</h2>
        <ol className={`${styles.rulesNote} ${styles.setupList}`}>{content.setup.map((step, index) => <li key={index}>{step}</li>)}</ol>
      </section>

      <section className={styles.section} aria-labelledby="how-to-play">
        <h2 id="how-to-play" className={styles.sectionHeading}>How to play</h2>
        <ol className={styles.rulesGrid}>{content.steps.map(([title, text], index) => <li key={title} className={styles.rule}><span className={styles.ruleNumber} aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
      </section>

      {content.sections.map(section => <Section key={section.heading} section={section} />)}

      {content.example && <section className={styles.section} aria-labelledby="example">
        <h2 id="example" className={styles.sectionHeading}>{content.example.heading}</h2>
        <div className={styles.rulesNote}>{content.example.body}</div>
      </section>}

      <section className={styles.section} aria-labelledby="how-to-win">
        <h2 id="how-to-win" className={styles.sectionHeading}>How to win</h2>
        <div className={`${styles.rulesNote} ${styles.winNote}`}>{content.win.map((text, index) => <p key={index}>{text}</p>)}</div>
      </section>

      {content.variations && <Section section={content.variations} />}

      <div className={styles.actions}>
        <Link className={styles.secondary} to="/">Back to home</Link>
        <button className={styles.primary} disabled aria-describedby="coming-soon">Start game <Icon name="arrowUpRight" /></button>
      </div>
      <p id="coming-soon" className={styles.comingSoon}>Coming soon · gameplay isn't available yet</p>
      <p className={styles.sourceNote}>Rules summarized for Party Games Galore from: {content.sources.map((source, index) => <span key={source.href}>{index > 0 && ' · '}<a href={source.href} target="_blank" rel="noreferrer">{source.label}</a></span>)}</p>
    </article></main>
    <footer className={styles.footer}>{content.footer} <Icon name="sparkle" /></footer>
  </div>;
}

export function Chain({ words }: { words: string[] }) {
  return <p className={styles.chain}>{words.map((word, index) => <Fragment key={word}>{index > 0 && <span className={styles.chainArrow} aria-hidden="true">→</span>}<span className={styles.chainWord}>{word}</span></Fragment>)}</p>;
}

export function ExampleList({ items }: { items: ReactNode[] }) {
  return <ul className={styles.exampleList}>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}

function Section({ section }: { section: RulesSection }) {
  const id = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return <section className={styles.section} aria-labelledby={id}>
    <h2 id={id} className={styles.sectionHeading}>{section.heading}</h2>
    {section.intro && <p className={styles.sectionIntro}>{section.intro}</p>}
    <div className={styles.cardGrid}>{section.items.map(([title, text]) => <div key={title} className={styles.card}><h3>{title}</h3><p>{text}</p></div>)}</div>
  </section>;
}
