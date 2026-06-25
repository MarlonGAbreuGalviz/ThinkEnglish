import LoginPage from '../pages/LoginPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import HierarchyPage from '../pages/HierarchyPage.jsx';
import CategoryPage from '../pages/CategoryPage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useRouter } from './RouterContext.jsx';

export default function AppRoutes() {
  const { path, navigate } = useRouter();
  const { isAuthenticated } = useAuth();

  if (path === '/login') {
    return <LoginPage />;
  }

  if (path === '/forgot-password') {
    return <ForgotPasswordPage />;
  }

  if (path === '/register') {
    return <RegisterPage />;
  }

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  let page = <DashboardPage />;

  if (path === '/categories/tree') {
    page = <HierarchyPage />;
  } else if (path === '/categories/main') {
    page = <DashboardPage />;
  } else if (path.startsWith('/categories/')) {
    page = <CategoryPage categoryId={decodeURIComponent(path.replace('/categories/', ''))} />;
  } else if (path !== '/') {
    navigate('/', { replace: true });
    return null;
  }

  return <ProtectedRoute>{page}</ProtectedRoute>;
}
