import { activeTeam, roundNumber, score, totalFor } from './engine';
import type { Match, Team } from './engine';
import styles from './Charades.module.css';

export function Scoreboard({ match }: { match: Match }) {
  const team = activeTeam(match);
  return <section className={styles.scoreSection} aria-label="Scoreboard">
    <div className={styles.scoreHeading}><h2>The score so far</h2><span>{match.phase === 'finished' ? 'FINAL SCORES' : 'CONFIRMED TURNS'}</span></div>
    <div className={styles.scoreScroll} tabIndex={0} role="region" aria-label="Round scores; scroll horizontally for more rounds">
      <table className={styles.scoreboard}>
        <caption className={styles.srOnly}>Each round includes a turn for both teams. Dashes mean not yet played.</caption>
        <thead><tr><th scope="col">Team</th>{Array.from({ length: match.settings.rounds }, (_, index) => <th scope="col" key={index}>R{index + 1}</th>)}<th scope="col">Total</th></tr></thead>
        <tbody>{([1, 2] as Team[]).map(id => <tr key={id} className={id === 1 ? styles.pinkRow : styles.blueRow}>
          <th scope="row">Team {id}{match.phase !== 'finished' && team === id && <span className={styles.activeLabel}> · up now</span>}</th>
          {Array.from({ length: match.settings.rounds }, (_, index) => {
            const turn = match.completed.find(item => item.team === id && item.round === index + 1);
            const active = match.phase !== 'finished' && id === team && index + 1 === roundNumber(match);
            return <td key={index} className={active ? styles.activeCell : undefined}>{turn ? score(turn.entries) : '—'}</td>;
          })}<td className={styles.total}>{totalFor(match, id)}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {match.phase !== 'ready' && match.phase !== 'finished' && <p className={styles.provisional}>Team {team} this turn: <strong>{score(match.entries)}</strong> points · awaiting confirmation</p>}
  </section>;
}
