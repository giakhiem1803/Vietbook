import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setToken } from '../auth/token';
import { setUserInfo } from '../auth/userInfo';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.login(form);
      setToken(result.access_token);
      setUserInfo(result.user);
      navigate('/books');
      window.location.reload();
    } catch {
      setError('Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-narrow">
      <h2 className="section-title">Đăng nhập</h2>
      <p className="section-sub">Chào mừng quay lại Vietbook</p>

      <div className="card card-pad">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className="input" />
          </div>
          <div className="field">
            <label>Mật khẩu</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="input" />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>

      <p className="text-sm muted" style={{ marginTop: '14px', textAlign: 'center' }}>
        Tài khoản admin mẫu: admin@vietbook.com / admin123
      </p>
      <p className="text-sm" style={{ marginTop: '8px', textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Đăng ký</Link>
      </p>
    </div>
  );
};

export default LoginPage;
