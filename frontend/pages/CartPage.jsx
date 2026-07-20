import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../auth/useAuth';
import { resolveImageUrl } from '../api/axiosClient';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalQuantity, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setPlacingOrder(true);
    setError('');
    try {
      const order = await ordersApi.checkout(items);
      clearCart();
      navigate(`/orders/${order.id}/payment`);
    } catch {
      setError('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <h2 className="section-title">Giỏ hàng của bạn</h2>
        <div className="empty-state">Giỏ hàng đang trống. Hãy thêm vài cuốn sách nhé!</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="section-title">Giỏ hàng của bạn</h2>
      <p className="section-sub">{totalQuantity} sản phẩm · Tổng: <strong style={{ color: 'var(--color-text)' }}>{totalPrice.toLocaleString('vi-VN')} đ</strong></p>

      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Sách</th><th align="center">Giá</th><th align="center">Số lượng</th><th align="center">Tạm tính</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={resolveImageUrl(item.imageUrl)} alt={item.name} style={{ width: '44px', height: '58px', objectFit: 'cover', borderRadius: '4px' }} />
                    <span>{item.name}</span>
                  </div>
                </td>
                <td align="center">{item.price.toLocaleString('vi-VN')} đ</td>
                <td align="center">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-outline btn-sm">-</button>
                  <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-outline btn-sm">+</button>
                </td>
                <td align="center">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                <td align="center">
                  <button onClick={() => removeFromCart(item.id)} className="btn btn-danger btn-sm">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>{error}</div>}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={clearCart} className="btn btn-outline">Xóa hết giỏ hàng</button>
        <button onClick={handleCheckout} disabled={placingOrder} className="btn btn-primary">
          {placingOrder ? 'Đang đặt hàng...' : 'Thanh toán →'}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
