import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../auth/useAuth';
import StatusBadge from '../components/StatusBadge';

const ALLOWED_STATUSES = ['PLACED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELED'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data);
    } catch {
      setError('Không tải được chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusChange = async (e) => {
    try {
      const updated = await ordersApi.updateStatus(order.id, e.target.value);
      setOrder(updated);
    } catch {
      alert('Cập nhật trạng thái thất bại.');
    }
  };

  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!order) return <div className="page"><p className="muted">Không tìm thấy đơn hàng.</p></div>;

  return (
    <div className="page">
      <Link to="/orders" className="text-sm muted" style={{ display: 'inline-block', marginBottom: '16px' }}>← Quay lại danh sách đơn</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="section-title">Đơn hàng #{order.id}</h2>
        {isAdmin ? (
          <select value={order.status} onChange={handleStatusChange} className="input" style={{ maxWidth: '200px' }}>
            {ALLOWED_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        ) : (
          <StatusBadge status={order.status} />
        )}
      </div>

      <p className="section-sub">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>

      <div className="card" style={{ marginTop: '10px' }}>
        <table className="table">
          <thead><tr><th>Sách</th><th align="center">Giá</th><th align="center">Số lượng</th><th align="center">Tạm tính</th></tr></thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.book_title}</td>
                <td align="center">{item.book_price.toLocaleString('vi-VN')} đ</td>
                <td align="center">{item.quantity}</td>
                <td align="center">{item.line_total.toLocaleString('vi-VN')} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ textAlign: 'right', marginTop: '12px', fontSize: '1.1rem' }}>
        Tổng cộng: <strong>{order.total_amount.toLocaleString('vi-VN')} đ</strong>
      </p>
    </div>
  );
};

export default OrderDetailPage;
