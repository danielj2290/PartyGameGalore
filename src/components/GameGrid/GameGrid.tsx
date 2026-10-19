import { games } from '../../games/registry';
import { GameCard } from '../GameCard/GameCard';
import styles from './GameGrid.module.css';
export function GameGrid(){return <section id="games" className={styles.section} aria-labelledby="games-title"><div className={styles.heading}><div><p>PICK A GAME. MAKE A NIGHT OF IT.</p><h2 id="games-title">The good-time lineup<span aria-hidden="true">.</span></h2></div><span className={styles.note}>Small screens. Big memories.</span></div><div className={styles.grid}>{games.map((game,index)=><GameCard key={game.id} game={game} index={index}/>)}</div></section>}
