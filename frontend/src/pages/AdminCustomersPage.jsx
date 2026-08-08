import { useEffect, useState } from 'react';
import { customersApi } from '../api/customersApi';
import { getApiErrorMessage } from '../api/errorHandler';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); setError(''); customersApi.getAll().then(setCustomers).catch((requestError) => setError(getApiErrorMessage(requestError, 'Không tải được dữ liệu khách hàng.'))).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  return <div className="page"><h2 className="section-title">Thông tin khách hàng</h2><p className="section-sub">Dữ liệu riêng tư — chỉ quản trị viên được phép xem.</p>{loading ? <div className="empty-state">Đang tải khách hàng...</div> : error ? <div className="alert alert-error">{error} <button className="btn btn-outline btn-sm" onClick={load}>Thử lại</button></div> : customers.length === 0 ? <div className="empty-state">Chưa có khách hàng.</div> : <div className="card"><table className="table"><thead><tr><th>Khách hàng</th><th>Email</th><th>Số điện thoại</th><th>Địa chỉ nhận hàng</th></tr></thead><tbody>{customers.map((c) => <tr key={c.id}><td>{c.full_name}</td><td>{c.email}</td><td>{c.phone || '—'}</td><td>{c.address || '—'}</td></tr>)}</tbody></table></div>}</div>;
};
export default AdminCustomersPage;
