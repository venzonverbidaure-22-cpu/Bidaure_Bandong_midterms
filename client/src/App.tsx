import { MicroProvider, useMicroContext } from './context/MicroContext';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import './index.css';

function AppContent() {
  const { state } = useMicroContext();

  if (!state.token) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <MicroProvider>
      <AppContent />
    </MicroProvider>
  );
}

export default App;
