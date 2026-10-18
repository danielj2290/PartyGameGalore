import { Icon } from '../../components/Icon/Icon';
import type { CSSProperties } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useHeadsUp } from './HeadsUpContext';
import { score, totalFor } from './engine';
import styles from './HeadsUp.module.css';

export function Results() {
  const { match } = useHeadsUp();
  const navigate = useNavigate();
  if (!match) return <Navigate to="/heads-up/settings" replace />;
  if (match.phase !== 'finished') return <Navigate to="/heads-up/play" replace />;
  const ranked = match.participants.map(person => ({ ...person, total: totalFor(match, person.id) })).sort((a, b) => b.total - a.total);
  const winners = ranked.filter(person => person.total === ranked[0].total);
  return <section className={styles.results}><p className={styles.eyebrow}>THE BIG REVEAL</p><span className={styles.resultsStar} aria-hidden="true"><Icon name="burst" /></span><h1 tabIndex={-1}>{winners.length === 1 ? `${winners[0].label} takes the crown!` : 'It’s a draw!'}</h1><p className={styles.lede}>{winners.length > 1 ? `${winners.map(person => person.label).join(' & ')} share the top spot.` : 'Good clues. Quick guesses. A night to remember.'}</p>
    <div className={styles.finalScores} aria-label="Final scores">{ranked.map(person => <article key={person.id} style={{ '--participant': person.color } as CSSProperties}><span>{person.label}</span><strong>{person.total}</strong><span>points{winners.some(winner => winner.id === person.id) ? ' · winner' : ''}</span></article>)}</div>
    <div className={styles.actions}><button className={styles.primary} onClick={() => navigate('/heads-up/settings')}>Play again <Icon name="arrowUpRight" /></button><Link className={styles.secondary} to="/">Exit home</Link></div>
    <h2 className={styles.historyHeading}>Every clue had its moment.</h2><div className={styles.historyGrid}>{match.participants.map(person => <section key={person.id} className={styles.historyTeam} style={{ '--participant': person.color } as CSSProperties}><h3>{person.label}</h3>{match.completed.filter(turn => turn.participant === person.id).map(turn => <details key={turn.round}><summary>{match.settings.mode === 'teams' ? `Round ${turn.round}` : 'Your turn'}<span>{score(turn.entries)} points</span></summary><ul>{turn.entries.map((entry, i) => <li key={`${entry.word.id}-${i}`}><span>{entry.word.text}</span><span className={entry.outcome === 'correct' ? styles.correctLabel : styles.hint}>{entry.outcome === 'correct' ? 'Correct · +1' : entry.outcome === 'skipped' ? 'Skipped' : 'Unanswered'}</span></li>)}</ul></details>)}</section>)}</div>
  </section>;
}
