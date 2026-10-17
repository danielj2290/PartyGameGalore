import styles from './Sparkles.module.css';
export function Sparkles(){return <div className={styles.sparkles} aria-hidden="true">{Array.from({length:6},(_,i)=><span key={i}>✦</span>)}</div>}
