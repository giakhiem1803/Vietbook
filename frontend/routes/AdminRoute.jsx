import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const AdminRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role !== 'ADMIN') {
    return (
      <section style={{ padding: '24px' }}>
        <h2>Access Denied</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
      </section>
    );
  }
  return <Outlet />;
};

export default AdminRoute;
