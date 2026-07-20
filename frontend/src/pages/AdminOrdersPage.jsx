import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';

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

  if (loading) return <p style={{ padding: '24px' }}>Đang tải...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  return (
    <section style={{ padding: '24px' }}>
      <h2>Quản lý đơn hàng (Admin)</h2>
      {orders.length === 0 ? <p>Chưa có đơn hàng nào.</p> : (
        <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Mã đơn</th>
              <th align="center">Trạng thái</th>
              <th align="center">Tổng tiền</th>
              <th align="center">Ngày đặt</th>
              <th align="center">Quản lý</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                <td>#{o.id}</td>
                <td align="center">{o.status}</td>
                <td align="center">{o.total_amount.toLocaleString('vi-VN')} đ</td>
                <td align="center">{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                <td align="center"><Link to={`/orders/${o.id}`}>Quản lý</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default AdminOrdersPage;
