import { useEffect, useState } from 'react';
import { settingsApi } from '../api/settingsApi';

const BANKS = [
  { name: 'Vietcombank', bin: '970436' },
  { name: 'VietinBank', bin: '970415' },
  { name: 'BIDV', bin: '970418' },
  { name: 'Agribank', bin: '970405' },
  { name: 'Techcombank', bin: '970407' },
  { name: 'MB Bank', bin: '970422' },
  { name: 'ACB', bin: '970416' },
  { name: 'VPBank', bin: '970432' },
  { name: 'TPBank', bin: '970423' },
  { name: 'Sacombank', bin: '970403' },
];

const AdminBankSettingsPage = () => {
  const [form, setForm] = useState({ bank_name: '', bank_bin: '', account_number: '', account_name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsApi.getBank();
        setForm(data);
      } catch {
        setError('Không tải được cài đặt.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBankSelect = (e) => {
    const selected = BANKS.find((b) => b.name === e.target.value);
    if (selected) {
      setForm((prev) => ({ ...prev, bank_name: selected.name, bank_bin: selected.bin }));
    }
  };

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await settingsApi.updateBank(form);
      setSuccess('Đã lưu thông tin ngân hàng.');
    } catch {
      setError('Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;

  return (
    <div className="page-narrow">
      <h2 className="section-title">Cài đặt thanh toán</h2>
      <p className="section-sub">Thông tin tài khoản ngân hàng dùng để tạo mã QR nhận thanh toán</p>

      <div className="card card-pad">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Chọn ngân hàng</label>
            <select className="input" value={form.bank_name} onChange={handleBankSelect}>
              <option value="">-- Chọn ngân hàng --</option>
              {BANKS.map((b) => <option key={b.bin} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Mã BIN ngân hàng (tự điền khi chọn ở trên)</label>
            <input name="bank_bin" value={form.bank_bin} onChange={handleChange} className="input" placeholder="vd: 970436" />
          </div>
          <div className="field">
            <label>Số tài khoản</label>
            <input name="account_number" value={form.account_number} onChange={handleChange} required className="input" />
          </div>
          <div className="field">
            <label>Tên chủ tài khoản (KHÔNG DẤU)</label>
            <input name="account_name" value={form.account_name} onChange={handleChange} required className="input" placeholder="vd: NGUYEN VAN A" />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <button type="submit" disabled={saving} className="btn btn-primary btn-block">
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </form>
      </div>

      <p className="text-sm muted" style={{ marginTop: '14px' }}>
        Thông tin này sẽ dùng để tạo mã QR VietQR hiển thị cho khách khi thanh toán đơn hàng.
      </p>
    </div>
  );
};

export default AdminBankSettingsPage;
