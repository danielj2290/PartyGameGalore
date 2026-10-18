import { DiscoBall } from '../components/DiscoBall/DiscoBall';
import { Sparkles } from '../components/Sparkles/Sparkles';
import { LightReflections } from '../components/LightReflections/LightReflections';
import { GameGrid } from '../components/GameGrid/GameGrid';
import { DanceFloor } from '../components/DanceFloor/DanceFloor';
import styles from './App.module.css';
export default function App(){return <div className={styles.page}><LightReflections/><header className={styles.header}><a className={styles.brand} href="#home" aria-label="Party Games Galore home"><span aria-hidden="true">✳</span> PGG<span className={styles.brandDot}>.</span></a><span className={styles.tag}><i/> GOOD TIMES AHEAD</span></header><main id="home"><section className={styles.hero} aria-labelledby="title"><div className={styles.ballStage}><DiscoBall/><Sparkles/></div><h1 id="title">Party Games <span>Galore<span className={styles.titleStar} aria-hidden="true">✦</span></span></h1></section><GameGrid/></main><footer className={styles.footer}><p>Your favorite people. A little friendly competition.<br/>Everything you need for a really good night.</p></footer><DanceFloor/></div>}
