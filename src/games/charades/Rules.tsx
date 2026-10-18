import { Icon } from '../../components/Icon/Icon';
import { Link } from 'react-router-dom';
import styles from './Charades.module.css';

const rules = [
  ['Make two teams', 'Team 1 and Team 2 each need an actor and at least one guesser. Switch actors each turn when you can.'],
  ['Keep the word a secret', 'Only the actor looks at the device. Face the screen away from the guessers, then use gestures to act out the word.'],
  ['Let your moves do the talking', 'No speaking, sound effects, mouthing, spelling, or writing the answer. Your teammates can guess as often as they like.'],
  ['Guess, score, keep going', 'Each correct word earns 1 point. Tap Correct for a new word, or Skip to pass without a point penalty. The timer keeps running.'],
  ['Give both teams their moment', 'Teams alternate. One round includes a turn for each team, so 3 rounds gives both teams 3 turns. No steals from the other team.'],
  ['Beat the buzzer', 'Stop guessing at zero. Review the words and fix accidental taps before confirming. Highest total wins; equal totals are a draw.'],
];

export function Rules() {
  return <section className={styles.introScreen}>
    <p className={styles.eyebrow}>THE CLASSIC · A LITTLE FRIENDLY COMPETITION</p>
    <h1 tabIndex={-1}>Big gestures.<br /><em>Bigger laughs.</em></h1>
    <p className={styles.lede}>Two teams. One actor. Guess before time runs out.</p>
    <div className={styles.rulesGrid}>{rules.map(([title, text], index) => <article className={styles.rule} key={title}><span className={styles.ruleNumber}>0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div>
    <div className={styles.actions}><Link className={styles.secondary} to="/">Back to home</Link><Link className={styles.primary} to="/charades/settings">Next: Settings <span aria-hidden="true"><Icon name="arrowUpRight" /></span></Link></div>
  </section>;
}
