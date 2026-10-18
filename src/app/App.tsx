import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import { CharadesProvider } from '../games/charades/CharadesContext';
import { CharadesLayout } from '../games/charades/CharadesLayout';
import { Rules } from '../games/charades/Rules';
import { Settings } from '../games/charades/Settings';
import { Play } from '../games/charades/Play';
import { Results } from '../games/charades/Results';
import { HeadsUpProvider } from '../games/heads-up/HeadsUpContext';
import { HeadsUpLayout } from '../games/heads-up/HeadsUpLayout';
import { Setup as HeadsUpSetup } from '../games/heads-up/Setup';
import { Rules as HeadsUpRules } from '../games/heads-up/Rules';
import { Settings as HeadsUpSettings } from '../games/heads-up/Settings';
import { Play as HeadsUpPlay } from '../games/heads-up/Play';
import { Results as HeadsUpResults } from '../games/heads-up/Results';
import { WavelengthProvider } from '../games/wavelength/WavelengthContext';
import { WavelengthLayout } from '../games/wavelength/WavelengthLayout';
import { Rules as WavelengthRules } from '../games/wavelength/Rules';
import { Settings as WavelengthSettings } from '../games/wavelength/Settings';
import { Play as WavelengthPlay } from '../games/wavelength/Play';
import { Results as WavelengthResults } from '../games/wavelength/Results';
function RouteEffects() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = 'Party Games Galore';
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return null;
}
export default function App() {
  return <HashRouter><CharadesProvider><HeadsUpProvider><WavelengthProvider><RouteEffects /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/charades" element={<CharadesLayout />}>
      <Route index element={<Navigate to="rules" replace />} />
      <Route path="rules" element={<Rules />} />
      <Route path="settings" element={<Settings />} />
      <Route path="play" element={<Play />} />
      <Route path="results" element={<Results />} />
    </Route>
    <Route path="/heads-up" element={<HeadsUpLayout />}>
      <Route index element={<Navigate to="setup" replace />} />
      <Route path="setup" element={<HeadsUpSetup />} />
      <Route path="rules" element={<HeadsUpRules />} />
      <Route path="settings" element={<HeadsUpSettings />} />
      <Route path="play" element={<HeadsUpPlay />} />
      <Route path="results" element={<HeadsUpResults />} />
    </Route>
    <Route path="/wavelength" element={<WavelengthLayout />}>
      <Route index element={<Navigate to="rules" replace />} />
      <Route path="rules" element={<WavelengthRules />} />
      <Route path="settings" element={<WavelengthSettings />} />
      <Route path="play" element={<WavelengthPlay />} />
      <Route path="results" element={<WavelengthResults />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></WavelengthProvider></HeadsUpProvider></CharadesProvider></HashRouter>;
}
