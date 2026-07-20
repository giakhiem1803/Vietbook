import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <section style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
      <h2>Chào mừng đến với Vietbook 📚</h2>
      <p>Nhà sách online với hàng ngàn đầu sách đủ thể loại — từ manga, tiểu thuyết đến sách kỹ năng sống.</p>
      <Link to="/books">
        <button style={{ padding: '10px 20px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '12px' }}>
          Xem sách ngay
        </button>
      </Link>
    </section>
  );
};

export default HomePage;
