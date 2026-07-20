import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../auth/useAuth';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalQuantity, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPlacingOrder(true);
    setError('');
    try {
      const order = await ordersApi.checkout(items);
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch {
      setError('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <section style={{ padding: '24px' }}>
        <h2>Giỏ hàng của bạn</h2>
        <p>Giỏ hàng đang trống. Hãy thêm vài cuốn sách nhé!</p>
      </section>
    );
  }

  return (
    <section style={{ padding: '24px' }}>
      <h2>Giỏ hàng của bạn</h2>
      <p>Tổng số lượng: <strong>{totalQuantity}</strong> | Tổng tiền: <strong>{totalPrice.toLocaleString('vi-VN')} đ</strong></p>

      <table style={{ width: '100%', marginTop: '16px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Sách</th>
            <th align="center">Giá</th>
            <th align="center">Số lượng</th>
            <th align="center">Tạm tính</th>
            <th align="center">Xóa</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                  <span>{item.name}</span>
                </div>
              </td>
              <td align="center">{item.price.toLocaleString('vi-VN')} đ</td>
              <td align="center">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 8px' }}>-</button>
                <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 8px' }}>+</button>
              </td>
              <td align="center">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
              <td align="center">
                <button onClick={() => removeFromCart(item.id)} style={{ padding: '4px 8px', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '4px' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button onClick={clearCart} style={{ padding: '8px 16px', backgroundColor: '#757575', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Xóa hết giỏ hàng
        </button>
        <button onClick={handleCheckout} disabled={placingOrder} style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px' }}>
          {placingOrder ? 'Đang đặt hàng...' : 'Thanh toán'}
        </button>
      </div>
    </section>
  );
};

export default CartPage;
