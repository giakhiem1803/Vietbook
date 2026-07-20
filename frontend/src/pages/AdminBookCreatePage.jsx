import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksApi } from '../api/booksApi';

const GENRES = ['Fiction', 'Non-fiction', 'Manga', 'Self-help', 'Kids'];

const AdminBookCreatePage = () => {
  const [form, setForm] = useState({
    title: '', author: '', price: '', genre: 'Fiction', description: '', imageUrl: '', stock: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await booksApi.create(form);
      navigate('/books');
    } catch {
      setError('Tạo sách thất bại. Kiểm tra lại bạn đã đăng nhập ADMIN chưa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '24px', maxWidth: '480px' }}>
      <h2>Thêm sách mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Tên sách</label>
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Tác giả</label>
          <input name="author" value={form.author} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Giá (VNĐ)</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} required min="1" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Thể loại</label>
          <select name="genre" value={form.genre} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Ảnh bìa (URL)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required placeholder="https://..." style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Mô tả</label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={3} style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Số lượng kho</label>
          <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 18px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Đang lưu...' : 'Lưu sách'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
    </section>
  );
};

export default AdminBookCreatePage;
