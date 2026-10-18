import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './GameDialog.module.css';

export function GameDialog({ title, children, onCancel }: { title: string; children: ReactNode; onCancel?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    element.showModal(); document.body.style.overflow = 'hidden'; heading.current?.focus();
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={id}
    onCancel={event => { event.preventDefault(); onCancel?.(); }}>
    <h2 id={id} ref={heading} tabIndex={-1}>{title}</h2>{children}
  </dialog>;
}
