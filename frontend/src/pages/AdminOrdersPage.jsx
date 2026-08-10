import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import StatusBadge from '../components/StatusBadge';
import { getApiErrorMessage } from '../api/errorHandler';
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { ordersApi.getAllForAdmin().then(setOrders).catch((e) => setError(getApiErrorMessage(e, 'Không tải được danh sách đơn hàng.'))).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;
  return <div className="page"><h2 className="section-title">Quản lý đơn hàng</h2><p className="section-sub">{orders.length} đơn hàng trong hệ thống</p>{error && <div className="alert alert-error">{error}</div>}{!error && (orders.length ? <div className="card"><table className="table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Trạng thái</th><th>Tổng tiền</th><th>Ngày đặt</th><th></th></tr></thead><tbody>{orders.map((o) => <tr key={o.id}><td>#{o.id}</td><td><strong>{o.customer?.full_name || '—'}</strong><br /><span className="muted text-sm">{o.customer?.email || '—'}<br />{o.customer?.phone || ''}</span></td><td><StatusBadge status={o.status} /></td><td>{o.total_amount.toLocaleString('vi-VN')} đ</td><td>{new Date(o.created_at).toLocaleString('vi-VN')}</td><td><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Quản lý</Link></td></tr>)}</tbody></table></div> : <div className="empty-state">Chưa có đơn hàng nào.</div>)}</div>;
}
