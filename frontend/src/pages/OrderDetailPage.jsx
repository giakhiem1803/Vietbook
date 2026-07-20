import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../auth/useAuth';

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

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (e) => {
    try {
      const updated = await ordersApi.updateStatus(order.id, e.target.value);
      setOrder(updated);
    } catch {
      alert('Cập nhật trạng thái thất bại.');
    }
  };

  if (loading) return <p style={{ padding: '24px' }}>Đang tải...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  if (!order) return <p style={{ padding: '24px' }}>Không tìm thấy đơn hàng.</p>;

  return (
    <section style={{ padding: '24px' }}>
      <Link to="/orders" style={{ display: 'inline-block', marginBottom: '16px' }}>← Quay lại danh sách đơn</Link>
      <h2>Đơn hàng #{order.id}</h2>
      <p>
        Trạng thái:{' '}
        {isAdmin ? (
          <select value={order.status} onChange={handleStatusChange}>
            {ALLOWED_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        ) : (
          <strong>{order.status}</strong>
        )}
      </p>
      <p>Tổng tiền: <strong>{order.total_amount.toLocaleString('vi-VN')} đ</strong></p>
      <p>Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</p>

      <h3 style={{ marginTop: '16px' }}>Sản phẩm</h3>
      <table style={{ width: '100%', marginTop: '8px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Sách</th>
            <th align="center">Giá</th>
            <th align="center">Số lượng</th>
            <th align="center">Tạm tính</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{item.book_title}</td>
              <td align="center">{item.book_price.toLocaleString('vi-VN')} đ</td>
              <td align="center">{item.quantity}</td>
              <td align="center">{item.line_total.toLocaleString('vi-VN')} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default OrderDetailPage;
