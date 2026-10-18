import { Icon } from '../Icon/Icon';
import styles from './Sparkles.module.css';
export function Sparkles(){return <div className={styles.sparkles} aria-hidden="true">{Array.from({length:6},(_,i)=><span key={i}><Icon name="sparkle" /></span>)}</div>}
