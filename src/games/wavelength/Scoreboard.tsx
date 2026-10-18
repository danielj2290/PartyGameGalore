import { openingScore, totalFor } from './engine';
import type { Match, Team } from './engine';
import styles from './Wavelength.module.css';

export function Scoreboard({ match }: { match: Match }) {
  const live = match.phase !== 'finished';
  return <section className={styles.scoreSection} aria-label="Scoreboard">
    <div className={styles.scoreHeading}><h2>The score so far</h2><span>{live ? 'CONFIRMED TURNS' : 'FINAL SCORES'}</span></div>
    <div className={styles.scoreScroll} role="region" aria-label="Turn scores; scroll horizontally for more turns" tabIndex={0}>
      <table className={styles.scoreboard}><caption className={styles.srOnly}>Points by turn, including opposing-team bonuses. Start shows the second-team head start in a score race.</caption>
        <thead><tr><th scope="col">Team</th><th scope="col">Start</th>{match.completed.map((_, index) => <th scope="col" key={index}>T{index + 1}</th>)}{live && <th scope="col">T{match.completed.length + 1}</th>}<th scope="col">Total</th></tr></thead>
        <tbody>{([1, 2] as Team[]).map(team => <tr key={team} className={team === 1 ? styles.pinkRow : styles.blueRow}>
          <th scope="row">Team {team}{live && team === match.team && <span className={styles.activeLabel}> · up now</span>}</th><td>{openingScore(match, team)}</td>
          {match.completed.map((turn, index) => <td key={index}>{turn.team === team ? turn.main : turn.bonus}</td>)}
          {live && <td className={team === match.team ? styles.activeCell : undefined}>—</td>}<td className={styles.total}>{totalFor(match, team)}</td>
        </tr>)}</tbody>
      </table>
    </div><p className={styles.scoreHint}>Points from a reveal are added only when you confirm the turn.</p>
  </section>;
}
