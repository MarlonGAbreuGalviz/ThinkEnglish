import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { path, navigate } = useRouter();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">TM</span>
          <div>
            <strong>ThinkEnglish</strong>
            <small>Manager</small>
          </div>
        </div>

        <nav className="side-nav" aria-label="Navegación principal">
          <button className={path === '/' || path === '/categories/main' ? 'active' : ''} onClick={() => navigate('/')}>
            <span>Panel</span>
          </button>
          <button className={path === '/categories/tree' ? 'active' : ''} onClick={() => navigate('/categories/tree')}>
            <span>Jerarquía</span>
          </button>
        </nav>

        <div className="sidebar-note">
          <span className="mini-label">Gestión académica</span>
          <p>Organiza categorías, niveles, videos y ejercicios para contenidos de inglés con IA.</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Mantenedor de contenidos IA</p>
            <h1>ThinkEnglish Manager</h1>
          </div>
          <div className="user-card">
            <div className="user-meta">
              <strong>{[user.name, user.lastName].filter(Boolean).join(' ') || user.email}</strong>
              <span>{user.email}</span>
            </div>
            <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
            <button className="button ghost" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}

