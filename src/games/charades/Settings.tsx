import { Icon } from '../../components/Icon/Icon';
import { Link, useNavigate } from 'react-router-dom';
import { useCharades } from './CharadesContext';
import type { Difficulty } from './words';
import type { Team } from './engine';
import styles from './Charades.module.css';

export function Settings() {
  const { settings, setSettings, dispatch } = useCharades();
  const navigate = useNavigate();
  return <section className={styles.settingsScreen}>
    <p className={styles.eyebrow}>SET THE MOOD</p><h1 tabIndex={-1}>Your night.<br /><em>Your rules.</em></h1>
    <p className={styles.lede}>A few small choices. A whole lot of fun.</p>
    <form className={styles.settingsPanel} onSubmit={event => { event.preventDefault(); dispatch({ type: 'NEW', settings }); navigate('/charades/play'); }}>
      <div className={styles.formGrid}>
        <label className={styles.field}>Time per turn<select value={settings.seconds} onChange={event => setSettings({ ...settings, seconds: Number(event.target.value) })}>{[30, 60, 90, 120].map(value => <option key={value} value={value}>{value === 60 ? '1 minute' : `${value} seconds`}</option>)}</select><span>Same amount of time for both teams.</span></label>
        <label className={styles.field}>Skips per turn<select value={settings.skips ?? 'unlimited'} onChange={event => setSettings({ ...settings, skips: event.target.value === 'unlimited' ? null : Number(event.target.value) })}><option value="unlimited">Unlimited</option>{[0, 1, 3, 5].map(value => <option key={value} value={value}>{value} skips</option>)}</select><span>A fresh allowance at the start of every turn.</span></label>
        <label className={styles.field}>Word difficulty<select value={settings.difficulty} onChange={event => setSettings({ ...settings, difficulty: event.target.value as Difficulty })}><option value="easy">Easy · familiar words & actions</option><option value="challenging">Challenging · imaginative scenes & expressions</option></select><span>One difficulty for the whole match.</span></label>
        <label className={styles.field}>Category<select defaultValue="all"><option value="all">All words</option>{['Everyday things', 'Animals', 'Actions', 'Movies & TV'].map(category => <option key={category} disabled>{category} — Coming soon</option>)}</select><span>Specific category selections are coming later.</span></label>
        <label className={styles.field}>Number of rounds<select value={settings.rounds} onChange={event => setSettings({ ...settings, rounds: Number(event.target.value) })}>{Array.from({ length: 10 }, (_, index) => <option key={index} value={index + 1}>{index + 1} {index === 0 ? 'round' : 'rounds'}</option>)}</select><span>Each round gives both teams a turn.</span></label>
        <label className={styles.field}>Starting team<select value={settings.startingTeam} onChange={event => setSettings({ ...settings, startingTeam: event.target.value === 'random' ? 'random' : Number(event.target.value) as Team })}><option value="random">Random · let fate decide</option><option value="1">Team 1 · pink</option><option value="2">Team 2 · blue</option></select><span>The same team opens each round.</span></label>
      </div>
      <p className={styles.settingsSummary}>{settings.rounds * 2} turns total · {settings.seconds} seconds per turn · two teams</p>
      <div className={styles.actions}><Link className={styles.secondary} to="/charades/rules">Back: Rules</Link><button className={styles.primary} type="submit">Start game <span aria-hidden="true"><Icon name="arrowUpRight" /></span></button></div>
    </form>
  </section>;
}
