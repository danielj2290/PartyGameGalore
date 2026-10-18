import { Icon } from '../../components/Icon/Icon';
import { Link, useNavigate } from 'react-router-dom';
import { useHeadsUp } from './HeadsUpContext';
import { teamRounds } from './engine';
import { categories, getCategoryWords } from './categories';
import type { CategoryId } from './categories';
import styles from './HeadsUp.module.css';

export function Settings() {
  const { settings, setSettings, dispatch, setAssistedPlay, device } = useHeadsUp();
  const navigate = useNavigate();
  const teams = settings.mode === 'teams';
  const minimum = teams ? 4 : 2;
  const rounds = teamRounds(settings.players);
  return <section className={styles.intro}><p className={styles.eyebrow}>SET THE MOOD</p><h1 tabIndex={-1}>Your people.<br /><em>Your kind of game.</em></h1><p className={styles.lede}>Pick your crowd. We’ll take care of the turns.</p>
    <form className={styles.settingsPanel} onSubmit={event => { event.preventDefault(); dispatch({ type: 'NEW', settings }); navigate('/heads-up/play'); }}>
      <fieldset className={styles.modeField}><legend>Game mode</legend><div className={styles.modeChoices}>{(['teams', 'ffa'] as const).map(mode => <label key={mode} data-selected={settings.mode === mode}><input type="radio" name="game-mode" value={mode} checked={settings.mode === mode} onChange={() => setSettings({ ...settings, mode, players: Math.max(mode === 'teams' ? 4 : 2, settings.players) })} /><span>{mode === 'teams' ? 'Two teams' : 'Free-for-all'}</span><small>{mode === 'teams' ? 'Pink vs blue. One shared victory.' : 'A turn in the spotlight for everyone.'}</small></label>)}</div></fieldset>
      <div className={styles.formGrid}>
        <label className={styles.field}>Number of players<select value={settings.players} onChange={event => setSettings({ ...settings, players: Number(event.target.value) })}>{Array.from({ length: 21 - minimum }, (_, i) => <option value={i + minimum} key={i}>{i + minimum} players</option>)}</select><span>{teams ? 'Split into two teams as evenly as possible.' : 'Each player gets one timed turn.'}</span></label>
        <label className={styles.field}>Time per turn<select value={settings.seconds} onChange={event => setSettings({ ...settings, seconds: Number(event.target.value) })}>{[30, 60, 90, 120].map(seconds => <option key={seconds} value={seconds}>{seconds === 60 ? '1 minute' : `${seconds} seconds`}</option>)}</select><span>The same timer applies to every turn.</span></label>
        <label className={`${styles.field} ${styles.fullField}`}>Category<select value={settings.category} onChange={event => setSettings({ ...settings, category: event.target.value as CategoryId })}>{categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select><span>{categories.find(category => category.id === settings.category)?.description} {getCategoryWords(settings.category).length} prompts.</span></label>
        <label className={`${styles.assistedField} ${styles.fullField}`}><input type="checkbox" checked={settings.assistedPlay} onChange={event => setAssistedPlay(event.target.checked)} /><span><strong>Assisted play</strong><small>Show Correct and Skip buttons for a clue-giver to tap.{device === 'phone' ? ' Turn this off to use phone tilts.' : ' Arrow keys work with either setting.'}</small></span></label>
      </div>
      <div className={styles.scheduleSummary} role="status">{teams ? <><strong>{rounds} rounds · {rounds * 2} turns total</strong><span>Team 1: {Math.ceil(settings.players / 2)} players · Team 2: {Math.floor(settings.players / 2)} players</span><span>Both teams play {rounds} times. Rotate the guesser each turn.{settings.players % 2 === 1 ? ' The smaller team repeats one guesser.' : ''}</span></> : <><strong>{settings.players} players · {settings.players} turns total</strong><span>One turn per person, each with their own color.</span></>}</div>
      <div className={styles.actions}><Link className={styles.secondary} to="/heads-up/rules">Back: Rules</Link><button className={styles.primary} type="submit">Start game <Icon name="arrowUpRight" /></button></div>
    </form>
  </section>;
}
