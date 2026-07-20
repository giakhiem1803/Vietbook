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
import PaymentPage from './pages/PaymentPage';
import AdminBookFormPage from './pages/AdminBookFormPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBankSettingsPage from './pages/AdminBankSettingsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';

import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

const NotFoundPage = () => (
  <div className="page"><h2 className="section-title">404 - Không tìm thấy trang</h2></div>
);

const App = () => {
  return (
    <>
      <Header />
      <div className="flex-fill">
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
            <Route path="/orders/:id/payment" element={<PaymentPage />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin/books" element={<BooksPage />} />
            <Route path="/admin/books/new" element={<AdminBookFormPage />} />
            <Route path="/admin/books/:id/edit" element={<AdminBookFormPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/settings" element={<AdminBankSettingsPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer studentName="Nguyen Van A" courseName="Full-Stack Web Development" />
    </>
  );
};

export default App;
