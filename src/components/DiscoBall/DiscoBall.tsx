import { Icon } from '../Icon/Icon';
import styles from './DiscoBall.module.css';
export function DiscoBall(){return <div className={styles.fixture} aria-hidden="true"><div className={styles.chain}/><div className={styles.ball}><div className={styles.tiles}/><div className={styles.shading}/></div><span className={styles.glint}><Icon name="sparkle" /></span></div>}
