import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import { resolveImageUrl } from '../api/axiosClient';

const GENRES = ['Fiction', 'Non-fiction', 'Manga', 'Self-help', 'Kids'];

const emptyForm = { title: '', author: '', price: '', genre: 'Fiction', description: '', imageUrl: '', stock: 10 };

const AdminBookFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [restockQty, setRestockQty] = useState('');
  const [restockNote, setRestockNote] = useState('');
  const [restocking, setRestocking] = useState(false);
  const [stockLogs, setStockLogs] = useState([]);

  const loadBook = async () => {
    setLoading(true);
    try {
      const data = await booksApi.getById(id);
      setForm({
        title: data.title, author: data.author, price: data.price,
        genre: data.genre, description: data.description, imageUrl: data.imageUrl, stock: data.stock,
      });
      const logs = await booksApi.getStockLogs(id);
      setStockLogs(logs);
    } catch {
      setError('Không tải được thông tin sách.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) loadBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isEdit) {
        await booksApi.update(id, form);
        setSuccess('Đã lưu thay đổi.');
      } else {
        const created = await booksApi.create(form);
        navigate(`/admin/books/${created.id}/edit`);
        return;
      }
    } catch {
      setError('Lưu thất bại. Kiểm tra lại thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const updated = await booksApi.uploadImage(id, file);
      setForm((prev) => ({ ...prev, imageUrl: updated.imageUrl }));
      setSuccess('Đã cập nhật ảnh bìa.');
    } catch {
      setError('Tải ảnh lên thất bại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa cuốn sách này? Hành động không thể hoàn tác.')) return;
    try {
      await booksApi.delete(id);
      navigate('/admin/books');
    } catch {
      alert('Xóa thất bại.');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockQty || Number(restockQty) <= 0) return;
    setRestocking(true);
    try {
      const updated = await booksApi.restock(id, { quantity: Number(restockQty), note: restockNote || undefined });
      setForm((prev) => ({ ...prev, stock: updated.stock }));
      setRestockQty('');
      setRestockNote('');
      const logs = await booksApi.getStockLogs(id);
      setStockLogs(logs);
    } catch {
      alert('Nhập kho thất bại.');
    } finally {
      setRestocking(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;

  return (
    <div className="page" style={{ maxWidth: '760px' }}>
      <Link to="/admin/books" className="text-sm muted" style={{ display: 'inline-block', marginBottom: '16px' }}>← Quay lại quản lý sách</Link>
      <h2 className="section-title">{isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' }}>
        {/* Cot trai: form thong tin sach */}
        <div className="card card-pad" style={{ flex: '2', minWidth: '300px' }}>
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Tên sách</label><input name="title" value={form.title} onChange={handleChange} required className="input" /></div>
            <div className="field"><label>Tác giả</label><input name="author" value={form.author} onChange={handleChange} required className="input" /></div>
            <div className="input-row">
              <div className="field" style={{ flex: 1 }}><label>Giá (VNĐ)</label><input type="number" name="price" value={form.price} onChange={handleChange} required min="1" className="input" /></div>
              <div className="field" style={{ flex: 1 }}><label>Thể loại</label>
                <select name="genre" value={form.genre} onChange={handleChange} className="input">
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label>Ảnh bìa (URL, dùng nếu không upload file)</label><input name="imageUrl" value={form.imageUrl} onChange={handleChange} required placeholder="https://..." className="input" /></div>
            <div className="field"><label>Mô tả</label><textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input" /></div>
            {!isEdit && (
              <div className="field"><label>Số lượng kho ban đầu</label><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className="input" /></div>
            )}
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '6px' }}>
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sách'}
            </button>
            {isEdit && (
              <button type="button" onClick={handleDelete} className="btn btn-danger" style={{ marginLeft: '10px' }}>Xóa sách</button>
            )}
          </form>
        </div>

        {/* Cot phai: anh bia + nhap kho (chi hien khi edit) */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card card-pad">
            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Ảnh bìa hiện tại</label>
            {form.imageUrl && (
              <img src={resolveImageUrl(form.imageUrl)} alt="cover" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginTop: '8px' }} />
            )}
            {isEdit && (
              <div style={{ marginTop: '10px' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="input" />
                {uploadingImage && <p className="text-sm muted">Đang tải ảnh lên...</p>}
              </div>
            )}
          </div>

          {isEdit && (
            <div className="card card-pad">
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Tồn kho hiện tại: {form.stock}</label>
              <form onSubmit={handleRestock} style={{ marginTop: '10px' }}>
                <div className="field">
                  <label>Số lượng nhập thêm</label>
                  <input type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} className="input" placeholder="vd: 20" />
                </div>
                <div className="field">
                  <label>Ghi chú (tùy chọn)</label>
                  <input value={restockNote} onChange={(e) => setRestockNote(e.target.value)} className="input" placeholder="vd: nhập từ NXB Kim Đồng" />
                </div>
                <button type="submit" disabled={restocking} className="btn btn-outline btn-block btn-sm">
                  {restocking ? 'Đang nhập...' : '+ Nhập kho'}
                </button>
              </form>

              {stockLogs.length > 0 && (
                <div style={{ marginTop: '14px' }}>
                  <p className="text-sm muted" style={{ marginBottom: '6px' }}>Lịch sử nhập kho</p>
                  {stockLogs.map((log) => (
                    <div key={log.id} className="text-sm" style={{ padding: '6px 0', borderTop: '1px solid var(--color-border)' }}>
                      +{log.quantity} · {log.note || 'Không có ghi chú'}
                      <div className="muted" style={{ fontSize: '0.75rem' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookFormPage;
