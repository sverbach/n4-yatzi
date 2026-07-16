import { useGameStore } from './store/gameStore';
import { SetupScreen } from './components/SetupScreen';
import { PlayScreen } from './components/PlayScreen';
import { ResultsScreen } from './components/ResultsScreen';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const darkMode = useGameStore((s) => s.darkMode);

  return (
    <div
      data-theme={darkMode ? 'dark' : 'light'}
      className="min-h-screen font-mono transition-colors duration-[var(--dur-3)] [transition-timing-function:var(--ease)]"
      style={{
        background: 'var(--bg)',
        padding: '32px 24px 64px',
      }}
    >
      {phase === 'setup' && <SetupScreen />}
      {phase === 'playing' && <PlayScreen />}
      {phase === 'finished' && <ResultsScreen />}
    </div>
  );
}
