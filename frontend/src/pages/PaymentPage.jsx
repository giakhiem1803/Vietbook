import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersApi } from '../api/ordersApi';
import { settingsApi } from '../api/settingsApi';

const PaymentPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null); const [bank, setBank] = useState(null);
  const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    Promise.all([ordersApi.getOrderById(id), settingsApi.getBank()])
      .then(([currentOrder, currentBank]) => { setOrder(currentOrder); setBank(currentBank); })
      .catch(() => setError('Không tải được thông tin thanh toán.'));
  }, [id]);
  const copy = (value) => navigator.clipboard?.writeText(value);
  const submitTransfer = async () => {
    const payment = order?.payments?.[0]; if (!payment) return;
    setSubmitting(true); setError('');
    try { const updated = await ordersApi.submitPayment(payment.id); setOrder({ ...order, payment_status: updated.status, payments: [updated] }); }
    catch { setError('Không thể gửi yêu cầu xác nhận.'); }
    finally { setSubmitting(false); }
  };
  if (error && !order) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!order) return <div className="page"><p className="muted">Đang tải thông tin thanh toán...</p></div>;
  if (order.payment_method === 'COD') return <div className="page payment-page"><div className="card card-pad"><h2 className="section-title">Đơn #{order.id} đã đặt bằng COD</h2><p className="section-sub">Thanh toán {order.total_amount.toLocaleString('vi-VN')} đ khi nhận hàng. Cửa hàng sẽ xác nhận sau khi giao thành công.</p><Link to={`/orders/${order.id}`} className="btn btn-primary">Theo dõi đơn hàng</Link></div></div>;
  const payment = order.payments?.[0]; const configured = bank?.bank_bin && bank?.account_number;
  const qrUrl = configured ? `https://img.vietqr.io/image/${bank.bank_bin}-${bank.account_number}-compact2.png?amount=${Math.round(order.total_amount)}&addInfo=${payment?.transaction_code}&accountName=${encodeURIComponent(bank.account_name || '')}` : null;
  return <div className="page payment-page"><div className="payment-heading"><span className="eyebrow">THANH TOÁN AN TOÀN</span><h2 className="section-title">Thanh toán đơn hàng #{order.id}</h2><p className="section-sub">Tổng thanh toán: <b>{order.total_amount.toLocaleString('vi-VN')} đ</b></p></div><div className="payment-layout"><section className="card card-pad payment-details"><div className="payment-step">{order.payment_method === 'MOMO_QR' ? 'QR MOMO' : 'VIETQR'}</div><h3 style={{ marginTop: 0 }}>Quét mã và chuyển khoản</h3><p className="muted text-sm">Dùng đúng số tiền và nội dung <b>{payment?.transaction_code}</b>. Đơn chỉ được xem là đã thanh toán sau khi Admin xác nhận.</p>{order.payment_method === 'MOMO_QR' && <div className="momo-qr-frame"><img src="/momo-payment-qr.jpg" alt="Mã QR MoMo" /></div>}<p className="text-sm muted">Trạng thái: <b>{order.payment_status}</b></p>{error && <div className="alert alert-error">{error}</div>}<button type="button" onClick={submitTransfer} disabled={submitting || payment?.status !== 'PENDING'} className="btn btn-primary btn-block">{submitting ? 'Đang gửi...' : payment?.status === 'PENDING_CONFIRMATION' ? 'Đã gửi yêu cầu xác nhận' : 'Tôi đã chuyển khoản'}</button></section><section className="card card-pad payment-qr-card"><div className="payment-step">Chuyển khoản VietQR</div>{configured ? <><div className="qr-frame"><img src={qrUrl} alt="Mã thanh toán VietQR" /></div><div className="transfer-details" style={{ width: '100%', marginTop: 14 }}><div className="transfer-row"><span>Ngân hàng</span><strong>{bank.bank_name}</strong></div><div className="transfer-row"><span>Số tài khoản</span><strong>{bank.account_number} <button className="copy-button" onClick={() => copy(bank.account_number)}>Sao chép</button></strong></div><div className="transfer-row"><span>Nội dung</span><strong>{payment?.transaction_code} <button className="copy-button" onClick={() => copy(payment?.transaction_code)}>Sao chép</button></strong></div></div></> : <div className="alert alert-info">Cửa hàng chưa cấu hình tài khoản ngân hàng.</div>}</section></div><div className="payment-actions" style={{ maxWidth: 500, margin: '20px auto 0' }}><Link to={`/orders/${order.id}`} className="btn btn-primary btn-block">Theo dõi đơn hàng</Link><Link to="/books" className="btn btn-outline btn-block">Tiếp tục mua sắm</Link></div></div>;
};
export default PaymentPage;
