import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';
import { ChangePasswordForm } from './auth/ChangePasswordForm';
import { SessionWorkspace } from './session/SessionWorkspace';

function AuthGate() {
  const { auth, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (!auth) {
    return mode === 'login' ? (
        <LoginForm onSwitchToRegister={() => setMode('register')} />
    ) : (
        <RegisterForm onSwitchToLogin={() => setMode('login')} />
    );
  }

  if (showChangePassword) {
    return <ChangePasswordForm onClose={() => setShowChangePassword(false)} />;
  }

  return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <p style={{ margin: 0 }}>
            Logged in as <strong>{auth.teacherName}</strong>
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setShowChangePassword(true)}>Change password</button>
            <button onClick={logout}>Log out</button>
          </div>
        </div>
        <SessionWorkspace />
      </div>
  );
}

function App() {
  return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
        <h1>Virtual Student Simulator</h1>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </div>
  );
}

export default App;