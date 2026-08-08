import { useEffect, useState } from 'react';
import { adminStatsApi } from '../api/adminStatsApi';
import { getApiErrorMessage } from '../api/errorHandler';

const money = (value) => `${(value || 0).toLocaleString('vi-VN')} đ`;
const AdminDashboardPage = () => {
  const [days, setDays] = useState(30); const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { let active = true; setError(''); setData(null); const params = { days };
    Promise.all([adminStatsApi.getOverview(params), adminStatsApi.getRevenueSeries(params), adminStatsApi.getOrderStatuses(params), adminStatsApi.getTopBooks(params), adminStatsApi.getRecentOrders(), adminStatsApi.getLowStock()])
      .then(([overview, revenue, statuses, topBooks, recentOrders, lowStock]) => active && setData({ overview, revenue, statuses, topBooks, recentOrders, lowStock }))
      .catch((requestError) => active && setError(getApiErrorMessage(requestError, 'Không tải được số liệu thống kê.')));
    return () => { active = false; };
  }, [days]);
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <div className="page"><div className="empty-state">Đang tải dashboard...</div></div>;
  const { overview: o, revenue, statuses, topBooks, recentOrders, lowStock } = data; const max = Math.max(...revenue.values, 1);
  const cards = [['Tổng doanh thu', money(o.total_revenue)], ['Đã thanh toán', money(o.paid_revenue)], ['Tổng đơn', o.total_orders], ['Chờ xác nhận', o.pending_confirmation], ['Đơn COD', o.cod_orders], ['Khách mới', o.new_customers], ['Tồn kho thấp', o.low_stock]];
  return <div className="page dashboard-page"><div className="dashboard-head"><div><h2 className="section-title">Admin Dashboard</h2><p className="section-sub">Tổng quan vận hành Vietbook</p></div><select className="input dashboard-filter" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value={7}>7 ngày gần đây</option><option value={30}>30 ngày gần đây</option><option value={90}>90 ngày gần đây</option></select></div><div className="stat-grid">{cards.map(([label, value]) => <div className="stat-card" key={label}><div className="label">{label}</div><div className="value">{value}</div></div>)}</div><div className="dashboard-grid"><section className="card card-pad"><h3>Doanh thu theo ngày</h3>{revenue.labels.length ? <div className="bar-chart">{revenue.labels.map((label, i) => <div className="bar-col" key={label} title={`${label}: ${money(revenue.values[i])}`}><div className="bar" style={{ height: `${Math.max(4, revenue.values[i] / max * 150)}px` }} /><small>{label.slice(5)}</small></div>)}</div> : <p className="muted">Chưa có dữ liệu doanh thu.</p>}</section><section className="card card-pad"><h3>Phân bố trạng thái đơn</h3>{statuses.labels.length ? statuses.labels.map((label, i) => <div className="status-row" key={label}><span>{label}</span><b>{statuses.values[i]}</b></div>) : <p className="muted">Chưa có đơn hàng.</p>}</section><section className="card card-pad"><h3>Top 5 sách bán chạy</h3>{topBooks.length ? topBooks.map((book) => <div className="status-row" key={book.title}><span>{book.title}</span><b>{book.sold} cuốn</b></div>) : <p className="muted">Chưa có dữ liệu.</p>}</section><section className="card card-pad"><h3>Cảnh báo tồn kho thấp</h3>{lowStock.length ? lowStock.map((book) => <div className="status-row" key={book.id}><span>{book.title}</span><b>{book.stock} còn lại</b></div>) : <p className="muted">Tồn kho an toàn.</p>}</section></div><section className="card card-pad" style={{ marginTop: 18 }}><h3>Đơn hàng mới nhất</h3>{recentOrders.length ? <div className="recent-orders">{recentOrders.map((order) => <div className="status-row" key={order.id}><span>#{order.id} · {order.status} · {order.payment_method}</span><b>{money(order.total_amount)}</b></div>)}</div> : <p className="muted">Chưa có đơn hàng.</p>}</section></div>;
};
export default AdminDashboardPage;
