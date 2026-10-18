import { Icon } from '../../components/Icon/Icon';
import { Link } from 'react-router-dom';
import { useHeadsUp } from './HeadsUpContext';
import styles from './HeadsUp.module.css';

export function Rules() {
  const { device, controls } = useHeadsUp();
  const motion = device === 'phone' && controls === 'motion';
  const rules = [
    ['One guesser. Everyone else gives clues.', 'Hold the screen facing your friends so you can’t see the word. They describe it; you call out guesses. In team mode, only your teammates give clues.'],
    ['Describe around the answer.', 'Don’t say the word, any part of it, or spell it out. Give clues about what it does, looks like, or reminds you of.'],
    ['Got it? On to the next.', motion ? 'Tilt the screen toward the sky for Correct. Hold the tilt briefly, then return upright. Each correct guess earns 1 point.' : 'A clue-giver presses the Up arrow or taps Correct when you guess it. Each correct guess earns 1 point.'],
    ['Stumped? Keep things moving.', motion ? 'Tilt the screen toward the ground to Skip, then return upright before the next gesture. Skips are unlimited, with no point penalty.' : 'A clue-giver presses the Down arrow or taps Skip. Skips are unlimited, with no point penalty.'],
    ['Everyone gets their moment.', 'Teams alternate with equal turns. In free-for-all, each player gets one timed turn and everyone else can give clues. Change the guesser after every turn.'],
    ['Review, then pass it on.', 'Stop guessing at the buzzer. Fix any accidental Correct or Skip results before confirming. Scores are revealed at the end. Equal top scores mean a draw.'],
  ];
  return <section className={styles.intro}><p className={styles.eyebrow}>HOW TO PLAY</p><h1 tabIndex={-1}>The word’s behind you.<br /><em>The fun’s ahead.</em></h1><p className={styles.lede}>One person guesses. Their people bring the clues.</p><div className={styles.rulesGrid}>{rules.map(([title, text], i) => <article key={title} className={styles.rule}><span className={styles.ruleNumber}>0{i + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</div><div className={styles.actions}><Link className={styles.secondary} to="/heads-up/setup">Back: Device setup</Link><Link className={styles.primary} to="/heads-up/settings">Next: Settings <Icon name="arrowUpRight" /></Link></div></section>;
}
