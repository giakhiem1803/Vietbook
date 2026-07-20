import { Link } from 'react-router-dom';

const HomePage = () => (
  <main className="home-page">
    <section className="hero">
      <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
      <div className="hero-content">
        <span className="eyebrow">VIETBOOK · NHÀ SÁCH TRỰC TUYẾN</span>
        <h1>Mỗi cuốn sách,<br /><em>một thế giới mới.</em></h1>
        <p>Khám phá những câu chuyện, tri thức và cảm hứng được tuyển chọn dành cho bạn.</p>
        <div className="hero-actions"><Link to="/books" className="btn btn-primary">Khám phá sách <span>→</span></Link><a href="#about" className="hero-text-link">Tìm hiểu Vietbook</a></div>
      </div>
      <div className="hero-book-stack" aria-hidden="true"><div /><div /><div><span>V</span><small>VIETBOOK</small></div></div>
    </section>
    <section id="about" className="home-features">
      <div><b>01</b><h3>Tuyển chọn kỹ lưỡng</h3><p>Từ văn học đến kỹ năng, mỗi đầu sách đều đáng để mở ra.</p></div>
      <div><b>02</b><h3>Thanh toán tiện lợi</h3><p>Chuyển khoản ngân hàng nhanh chóng với mã QR VietQR.</p></div>
      <div><b>03</b><h3>Đồng hành cùng bạn</h3><p>Theo dõi đơn hàng và hành trình đọc của riêng mình.</p></div>
    </section>
  </main>
);

export default HomePage;
