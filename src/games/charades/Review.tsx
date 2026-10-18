import { Icon } from '../../components/Icon/Icon';
import { useCharades } from './CharadesContext';
import { Dialog } from './Dialog';
import { activeTeam, roundNumber, score } from './engine';
import type { Match, Outcome } from './engine';
import styles from './Charades.module.css';

export function Review({ match }: { match: Match }) {
  const { dispatch } = useCharades();
  const finalTurn = match.completed.length + 1 === match.settings.rounds * 2;
  return <Dialog title="Time’s up! Take a bow.">
    <p>Team {activeTeam(match)} · Round {roundNumber(match)} <strong className={styles.reviewScore}>{score(match.entries)} points</strong></p>
    <p className={styles.hint}>Accidental tap? Fix the labels below. Count a final answer only if it was guessed before the buzzer.</p>
    <ol className={styles.reviewList}>{match.entries.map((entry, index) => <li key={`${entry.word.id}-${index}`}>
      <span>{entry.word.text}</span><label><span className={styles.srOnly}>Outcome for word {index + 1}: {entry.word.text}</span><select value={entry.outcome} onChange={event => dispatch({ type: 'CORRECT', index, outcome: event.target.value as Outcome })}>
        <option value="correct">Correct · +1</option><option value="skipped">Skipped · 0</option><option value="unanswered">Unanswered · 0</option>
      </select></label>
    </li>)}</ol>
    <p className={styles.hint}>Scores are locked after confirmation.</p>
    <button className={styles.primary} onClick={() => dispatch({ type: 'CONFIRM' })}>{finalTurn ? 'See results' : match.completed.length % 2 === 1 ? 'Confirm & next round' : 'Confirm & next team'} <span aria-hidden="true"><Icon name="arrowUpRight" /></span></button>
  </Dialog>;
}
