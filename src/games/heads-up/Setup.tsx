import { Icon } from '../../components/Icon/Icon';
import { Link } from 'react-router-dom';
import { useHeadsUp } from './HeadsUpContext';
import type { DeviceMode } from './gestures';
import styles from './HeadsUp.module.css';

export function Setup() {
  const { device, chooseDevice, controls, useButtons, motion, practice, landscape } = useHeadsUp();
  const phone = device === 'phone';
  const practiced = practice.correct && practice.skipped;
  const canContinue = !phone || (landscape && (controls === 'buttons' || (motion.status === 'ready' && practiced && motion.upright)));
  const messages: Record<typeof motion.status, string> = {
    idle: 'Tap Enable motion, then allow motion access if your browser asks.',
    requesting: 'Waiting for your motion permission…',
    waiting: 'Listening for your phone. Hold it upright, with the screen facing your friends.',
    ready: practiced ? 'Both tilts checked. Return the phone upright to continue.' : 'Start upright. Hold a tilt briefly, then return upright between gestures.',
    denied: 'Motion access was not allowed. You can try again or use Assisted play.',
    unavailable: 'No usable motion data is arriving. Try again or have a friend use Assisted play.',
    insecure: 'Motion needs a secure connection. Open the HTTPS website on your phone, or use Assisted play.',
  };
  return <section className={styles.intro}>
    <p className={styles.eyebrow}>FIRST, GET COMFORTABLE</p><h1 tabIndex={-1}>{phone ? <>Turn it sideways.<br /><em>Bring on the clues.</em></> : <>Laptop ready.<br /><em>People, assemble.</em></>}</h1>
    <div className={styles.setupPanel}>
      <label className={styles.deviceField}>Playing on<select value={device} onChange={event => chooseDevice(event.target.value as DeviceMode)}><option value="phone">Phone / tablet</option><option value="keyboard">Laptop / keyboard</option></select></label>
      {phone ? <>
        <div className={styles.phoneDrawing} aria-hidden="true"><span>HEADS UP</span><i /></div>
        <h2>Flip your phone horizontally.</h2>
        <p>Use rotation lock if your phone supports locking in landscape. If it only locks in portrait, leave auto-rotate on. Keep the browser open—don’t lock the screen.</p>
        <p className={styles.orientationStatus} role="status">{landscape ? "Landscape view ready" : "Rotate your phone sideways to continue"}</p>
        {controls === 'motion' ? <div className={styles.motionPanel}>
          <h3>A quick tilt check</h3><p>Hold the phone upright with its screen facing away from you. Tilt the screen toward the sky for Correct, then toward the ground for Skip. Return upright between each tilt.</p>
          <div className={styles.practiceChecks}><span data-done={practice.correct}><Icon name="arrowUp" /> {practice.correct ? 'Up tilt checked' : 'Try upward tilt'}</span><span data-done={practice.skipped}><Icon name="arrowDown" /> {practice.skipped ? 'Down tilt checked' : 'Try downward tilt'}</span></div>
          <p className={styles.hint} role="status">{messages[motion.status]}</p>
          <div className={styles.actions}><button className={styles.secondary} disabled={['requesting', 'waiting'].includes(motion.status)} onClick={() => void motion.enable()}>{motion.status === 'ready' ? 'Recheck motion' : 'Enable motion'}</button><button className={styles.textButton} onClick={useButtons}>Use Assisted play instead</button></div>
        </div> : <p className={styles.hint}>Assisted play selected. A clue-giver can tap Correct or Skip for you. <button className={styles.inlineButton} onClick={() => chooseDevice('phone')}>Try motion instead</button></p>}
      </> : <>
        <div className={styles.keyDrawing} aria-hidden="true"><kbd><Icon name="arrowUp" /></kbd><kbd><Icon name="arrowDown" /></kbd></div>
        <h2>You guess. A friend takes the keys.</h2><p>Face the screen toward the clue-givers, where you can’t see it. One of them presses <strong><Icon name="arrowUp" /> for Correct</strong> or <strong><Icon name="arrowDown" /> to Skip</strong>. Enable Assisted play in Settings for on-screen controls.</p><p className={styles.hint}>Device detected automatically. Use the selector above if it guessed wrong.</p>
      </>}
    </div>
    <div className={styles.actions}><Link className={styles.secondary} to="/">Back to home</Link>{canContinue ? <Link className={styles.primary} to="/heads-up/rules">Next: How to play <Icon name="arrowUpRight" /></Link> : <button className={styles.primary} disabled>Next: How to play <Icon name="arrowUpRight" /></button>}</div>
  </section>;
}
