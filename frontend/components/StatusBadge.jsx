const MAP = {
  PLACED: { label: 'Chờ xử lý', cls: 'badge-placed' },
  PROCESSING: { label: 'Đang xử lý', cls: 'badge-processing' },
  SHIPPED: { label: 'Đang giao', cls: 'badge-shipped' },
  COMPLETED: { label: 'Hoàn tất', cls: 'badge-completed' },
  CANCELED: { label: 'Đã hủy', cls: 'badge-canceled' },
};

const StatusBadge = ({ status }) => {
  const info = MAP[status] || { label: status, cls: 'badge-placed' };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

export default StatusBadge;
