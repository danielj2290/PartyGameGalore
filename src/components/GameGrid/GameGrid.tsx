import { games } from '../../games/registry';
import { GameCard } from '../GameCard/GameCard';
import styles from './GameGrid.module.css';
export function GameGrid(){return <section id="games" className={styles.section} aria-label="Games"><div className={styles.grid}>{games.map((game,index)=><GameCard key={game.id} game={game} index={index}/>)}</div></section>}
