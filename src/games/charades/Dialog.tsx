import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import styles from './Charades.module.css';

export function Dialog({ title, children, onCancel }: { title: string; children: ReactNode; onCancel?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    heading.current?.focus();
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="dialog-title"
    onCancel={event => { event.preventDefault(); onCancel?.(); }}>
    <h2 id="dialog-title" ref={heading} tabIndex={-1}>{title}</h2>{children}
  </dialog>;
}
