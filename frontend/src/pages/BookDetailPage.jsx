import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import { useCart } from '../context/CartContext';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await booksApi.getById(id);
        setBook(data);
      } catch {
        setError('Không tải được thông tin sách.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return <p style={{ padding: '24px' }}>Đang tải...</p>;
  if (error) return <p style={{ padding: '24px', color: 'red' }}>{error}</p>;
  if (!book) return <p style={{ padding: '24px' }}>Không tìm thấy sách.</p>;

  return (
    <section style={{ padding: '24px' }}>
      <Link to="/books" style={{ display: 'inline-block', marginBottom: '16px' }}>← Quay lại danh sách</Link>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <img src={book.imageUrl} alt={book.title} style={{ width: '260px', height: '360px', objectFit: 'cover', borderRadius: '8px' }} />
        <div>
          <h2>{book.title}</h2>
          <p style={{ color: '#757575' }}>Tác giả: {book.author}</p>
          <p style={{ color: '#999' }}>Thể loại: {book.genre}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{book.price.toLocaleString('vi-VN')} đ</p>
          <p style={{ marginTop: '12px', maxWidth: '480px' }}>{book.description}</p>
          <p style={{ color: '#555' }}>Còn lại: {book.stock} cuốn</p>
          <button
            onClick={() => addToCart(book, 1)}
            style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookDetailPage;
