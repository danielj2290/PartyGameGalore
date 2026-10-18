import { Icon } from '../../components/Icon/Icon';
import { GameDialog } from '../shared/GameDialog';
import { useHeadsUp } from './HeadsUpContext';
import { activeParticipant } from './engine';
import type { Entry, Match } from './engine';
import styles from './HeadsUp.module.css';

export function Review({ match }: { match: Match }) {
  const { dispatch } = useHeadsUp();
  const last = match.completed.length + 1 === match.schedule.length;
  return <GameDialog title="Time’s up! Check your words."><p>{activeParticipant(match).label} · Turn {match.completed.length + 1} of {match.schedule.length}</p><p>Accidental tilt or key press? Fix the labels below before passing the device on. Only count answers guessed before the buzzer.</p>
    <ol className={styles.reviewList}>{match.entries.map((entry, i) => <li key={`${entry.word.id}-${i}`}><span>{entry.word.text}</span><label><span className={styles.srOnly}>Outcome for word {i + 1}: {entry.word.text}</span><select value={entry.outcome} onChange={event => dispatch({ type: 'CORRECT', index: i, outcome: event.target.value as Entry['outcome'] })}><option value="correct">Correct</option><option value="skipped">Skipped</option><option value="unanswered">Unanswered</option></select></label></li>)}</ol>
    <p className={styles.hint}>Scores stay under wraps until the end. Outcomes are locked after confirmation.</p><button className={styles.primary} onClick={() => dispatch({ type: 'CONFIRM' })}>{last ? 'See results' : 'Confirm & next turn'} <Icon name="arrowUpRight" /></button>
  </GameDialog>;
}
