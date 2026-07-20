import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminBookCreatePage from './pages/AdminBookCreatePage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

const NotFoundPage = () => (
  <section style={{ padding: '24px' }}>
    <h2>404 - Không tìm thấy trang</h2>
  </section>
);

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/books" element={<BooksPage />} />
          <Route path="/admin/books/new" element={<AdminBookCreatePage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer studentName="Nguyen Van A" courseName="Full-Stack Web Development" />
    </>
  );
};

export default App;
