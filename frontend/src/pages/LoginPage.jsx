import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <section style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label>Mật khẩu</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#888' }}>
        Tài khoản admin mẫu: admin@vietbook.com / admin123
      </p>
      <p style={{ marginTop: '8px' }}>
        Chưa có tài khoản? <a href="/register">Đăng ký</a>
      </p>
    </section>
  );
};

export default LoginPage;
