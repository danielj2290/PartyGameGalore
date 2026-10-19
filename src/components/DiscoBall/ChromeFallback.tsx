import styles from './DiscoBall.module.css';

export function ChromeFallback() {
  return <div className={styles.fallback} aria-hidden="true">
    {Array.from({ length: 49 }, (_, index) => <span className={styles.tile} key={index} />)}
  </div>;
}
