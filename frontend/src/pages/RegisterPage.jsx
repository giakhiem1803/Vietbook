import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const RegisterPage = () => {
  const [form, setForm] = useState({ email: '', full_name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.register(form);
      setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError('Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label>Họ tên</label>
          <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label>Mật khẩu (tối thiểu 6 ký tự)</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '12px' }}>{success}</p>}
    </section>
  );
};

export default RegisterPage;
