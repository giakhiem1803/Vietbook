import { useEffect, useState } from 'react';
import { adminStatsApi } from '../api/adminStatsApi';

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState({ months: [], revenues: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ov, mr] = await Promise.all([adminStatsApi.getOverview(), adminStatsApi.getMonthlyRevenue()]);
        setOverview(ov);
        setMonthly(mr);
      } catch {
        setError('Không tải được số liệu thống kê.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const maxRevenue = Math.max(...monthly.revenues, 1);

  return (
    <div className="page">
      <h2 className="section-title">Admin Dashboard</h2>
      <p className="section-sub">Tổng quan hoạt động kinh doanh</p>

      <div className="stat-grid">
        <div className="stat-card"><div className="label">Tổng số sách</div><div className="value">{overview.total_products}</div></div>
        <div className="stat-card"><div className="label">Tổng đơn hàng</div><div className="value">{overview.total_orders}</div></div>
        <div className="stat-card"><div className="label">Tổng doanh thu</div><div className="value">{overview.total_revenue.toLocaleString('vi-VN')} đ</div></div>
        <div className="stat-card"><div className="label">Tổng người dùng</div><div className="value">{overview.total_users}</div></div>
      </div>

      <h3 style={{ marginTop: '32px', fontSize: '1.1rem' }}>Doanh thu theo tháng</h3>
      <div className="card card-pad" style={{ marginTop: '12px' }}>
        {monthly.months.length === 0 ? (
          <p className="muted">Chưa có dữ liệu doanh thu.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px' }}>
            {monthly.months.map((m, idx) => (
              <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  title={`${monthly.revenues[idx].toLocaleString('vi-VN')} đ`}
                  style={{ width: '36px', height: `${(monthly.revenues[idx] / maxRevenue) * 160}px`, background: 'var(--color-text)', borderRadius: '4px 4px 0 0' }}
                />
                <span className="text-sm muted">{m}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
