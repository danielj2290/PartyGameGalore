import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import { CharadesProvider } from '../games/charades/CharadesContext';
import { CharadesLayout } from '../games/charades/CharadesLayout';
import { Rules } from '../games/charades/Rules';
import { Settings } from '../games/charades/Settings';
import { Play } from '../games/charades/Play';
import { Results } from '../games/charades/Results';
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
  return <HashRouter><CharadesProvider><RouteEffects /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/charades" element={<CharadesLayout />}>
      <Route index element={<Navigate to="rules" replace />} />
      <Route path="rules" element={<Rules />} />
      <Route path="settings" element={<Settings />} />
      <Route path="play" element={<Play />} />
      <Route path="results" element={<Results />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></CharadesProvider></HashRouter>;
}
