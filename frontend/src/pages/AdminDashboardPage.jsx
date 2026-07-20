import { useEffect, useState } from 'react';
import { adminStatsApi } from '../api/adminStatsApi';

const Card = ({ title, value, color }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa', flex: 1, minWidth: '160px' }}>
    <p style={{ margin: 0, color: '#777' }}>{title}</p>
    <h2 style={{ margin: '8px 0 0', color: color || '#1976d2' }}>{value}</h2>
  </div>
);

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

  if (loading) return <p style={{ padding: '24px' }}>Đang tải...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;

  const maxRevenue = Math.max(...monthly.revenues, 1);

  return (
    <section style={{ padding: '24px' }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
        <Card title="Tổng số sách" value={overview.total_products} color="#1976d2" />
        <Card title="Tổng đơn hàng" value={overview.total_orders} color="#f57c00" />
        <Card title="Tổng doanh thu" value={`${overview.total_revenue.toLocaleString('vi-VN')} đ`} color="#2e7d32" />
        <Card title="Tổng người dùng" value={overview.total_users} color="#7b1fa2" />
      </div>

      <h3 style={{ marginTop: '32px' }}>Doanh thu theo tháng</h3>
      {monthly.months.length === 0 ? (
        <p>Chưa có dữ liệu doanh thu.</p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', marginTop: '16px', borderBottom: '1px solid #ccc' }}>
          {monthly.months.map((m, idx) => (
            <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div
                title={`${monthly.revenues[idx].toLocaleString('vi-VN')} đ`}
                style={{
                  width: '40px',
                  height: `${(monthly.revenues[idx] / maxRevenue) * 160}px`,
                  backgroundColor: '#1976d2',
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#777' }}>{m}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminDashboardPage;
