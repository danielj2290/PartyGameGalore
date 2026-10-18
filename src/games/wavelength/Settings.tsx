import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../components/Icon/Icon';
import { useWavelength } from './WavelengthContext';
import { spectra } from './spectra';
import type { Team } from './engine';
import styles from './Wavelength.module.css';

export function Settings() {
  const { settings, setSettings, dispatch } = useWavelength();
  const navigate = useNavigate();
  return <section className={styles.intro}>
    <p className={styles.eyebrow}>SET THE FREQUENCY</p><h1 tabIndex={-1}>Your people.<br /><em>Your wavelength.</em></h1>
    <p className={styles.lede}>Two teams. Plenty of room for a good argument.</p>
    <form className={styles.settingsPanel} onSubmit={event => { event.preventDefault(); dispatch({ type: 'NEW', settings }); navigate('/wavelength/play'); }}>
      <div className={styles.formGrid}>
        <label className={styles.field}>Match style<select value={settings.mode} onChange={event => setSettings({ ...settings, mode: event.target.value as 'points' | 'rounds' })}><option value="points">Race to a score</option><option value="rounds">Fixed rounds</option></select><span>{settings.mode === 'points' ? 'Second team starts with 1 point. Catch-up turns and tiebreaks are on.' : 'Equal turns, both teams start at 0. Ties finish as a draw.'}</span></label>
        {settings.mode === 'points' ? <label className={styles.field}>Winning score<select value={settings.goal} onChange={event => setSettings({ ...settings, goal: Number(event.target.value) })}>{[10, 15, 20].map(goal => <option value={goal} key={goal}>{goal} points{goal === 10 ? ' · standard' : ''}</option>)}</select><span>Reach the goal with the higher total to win.</span></label> : <label className={styles.field}>Number of rounds<select value={settings.rounds} onChange={event => setSettings({ ...settings, rounds: Number(event.target.value) })}>{[3, 5, 7].map(rounds => <option value={rounds} key={rounds}>{rounds} rounds · {rounds * 2} turns</option>)}</select><span>One round gives each team one clue-giving turn.</span></label>}
        <label className={styles.field}>Discussion timer<select value={settings.seconds} onChange={event => setSettings({ ...settings, seconds: Number(event.target.value) })}><option value="0">Untimed · standard</option>{[60, 90, 120].map(seconds => <option key={seconds} value={seconds}>{seconds} seconds</option>)}</select><span>Optional house rule. Starts after the handoff; at zero, the current needle locks.</span></label>
        <label className={styles.field}>Starting team<select value={settings.startingTeam} onChange={event => setSettings({ ...settings, startingTeam: event.target.value === 'random' ? 'random' : Number(event.target.value) as Team })}><option value="random">Random · let fate decide</option><option value="1">Team 1 · pink</option><option value="2">Team 2 · blue</option></select><span>Swap clue-givers each time your team plays.</span></label>
      </div>
      <div className={styles.settingsSummary}><strong>{settings.mode === 'points' ? `First to ${settings.goal} points` : `${settings.rounds * 2} turns total`} · two teams</strong><span>{spectra.length} shuffled spectrum pairs · one device · 4+ players</span></div>
      <div className={styles.actions}><Link className={styles.secondary} to="/wavelength/rules">Back: Rules</Link><button className={styles.primary} type="submit">Start game <Icon name="arrowUpRight" /></button></div>
    </form>
  </section>;
}
