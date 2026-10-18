import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import styles from './Wavelength.module.css';

const rules = [
  ['Two teams, one shared instinct', 'Split into Team 1 and Team 2, with at least two people each. Pick a clue-giver and rotate that role every turn.'],
  ['Only the clue-giver looks', 'Privately reveal a target between two ideas. Think of something that belongs around that spot, then type a short clue. Hide the target before passing the device.'],
  ['One idea, then a poker face', 'Use a real thing or an established fictional thing. Avoid the endpoint words, their synonyms, and numeric hints. After your clue, stay silent and give no reactions.'],
  ['Talk it out, turn the dial', 'Your teammates debate the clue and agree where to place the needle. Lock the guess when everyone is happy. The target stays hidden.'],
  ['The other team gets a say', 'Before the reveal, the opponents predict whether the target center is left or right of the locked needle.'],
  ['Reveal, score, switch', 'The target bands award 4, 3, or 2 points; a miss earns 0. A correct opposing prediction earns 1, unless the active team hits the 4-point center.'],
];
export function Rules() {
  return <section className={styles.intro}>
    <p className={styles.eyebrow}>TWO TEAMS · ONE FREQUENCY</p>
    <h1 tabIndex={-1}>A little intuition.<br /><em>A lot to debate.</em></h1>
    <p className={styles.lede}>Read your teammate. Find the hidden target.</p>
    <div className={styles.rulesGrid}>{rules.map(([title, text], index) => <article key={title} className={styles.rule}><span className={styles.ruleNumber}>0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div>
    <div className={styles.rulesNote}><h2>How a match ends</h2><p>Standard: first to 10, with 1 starting point for the second team. A 4-point hit earns another turn if your team is still behind. A tie at the goal gets one extra turn each, repeating if needed.</p><p>Choose fixed rounds for a shorter match with equal turns and no catch-up turns. Discussion is untimed by default.</p></div>
    <div className={styles.actions}><Link className={styles.secondary} to="/">Back to home</Link><Link className={styles.primary} to="/wavelength/settings">Next: Settings <Icon name="arrowUpRight" /></Link></div>
    <p className={styles.sourceNote}>PGG local adaptation · original spectrum deck. <a href="https://www.sutherlandshire.nsw.gov.au/__data/assets/pdf_file/0032/77909/Wavelength-rulebook.pdf" target="_blank" rel="noreferrer">Wavelength rulebook</a></p>
  </section>;
}
