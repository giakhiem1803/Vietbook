import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import StatusBadge from '../components/StatusBadge';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAllForAdmin();
        setOrders(data);
      } catch {
        setError('Không tải được danh sách đơn hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page">
      <h2 className="section-title">Quản lý đơn hàng</h2>
      <p className="section-sub">{orders.length} đơn hàng trong hệ thống</p>
      {orders.length === 0 ? (
        <div className="empty-state">Chưa có đơn hàng nào.</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Mã đơn</th><th align="center">Trạng thái</th><th align="center">Tổng tiền</th><th align="center">Ngày đặt</th><th align="center"></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td align="center"><StatusBadge status={o.status} /></td>
                  <td align="center">{o.total_amount.toLocaleString('vi-VN')} đ</td>
                  <td align="center">{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                  <td align="center"><Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Quản lý</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
