import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { SessionWorkspace } from './session/SessionWorkspace';

function AuthGate() {
  const { auth } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  if (!auth) {
    return mode === 'login' ? (
        <LoginForm onSwitchToRegister={() => setMode('register')} />
    ) : (
        <RegisterForm onSwitchToLogin={() => setMode('login')} />
    );
  }

  return <SessionWorkspace />;
}

function App() {
  return (
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
  );
}

export default App;
