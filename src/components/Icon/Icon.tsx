import styles from './Icon.module.css';

export type IconName = 'sparkle' | 'burst' | 'arrowRight' | 'arrowUpRight' | 'arrowDownRight' | 'arrowUp' | 'arrowDown' | 'pause' | 'play' | 'check' | 'rotate';

// Pure CSS shapes keep every decorative symbol independent of emoji fonts.
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`${styles.icon} ${name.startsWith('arrow') ? styles.arrow : ''} ${styles[name]} ${className}`} />;
}
