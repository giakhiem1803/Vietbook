import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../api/axiosClient';
import { FallbackCover } from '../components/BookCard';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await booksApi.getById(id);
        setBook(data);
        setImageFailed(false);
      } catch {
        setError('Không tải được thông tin sách.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAdd = () => {
    addToCart(book, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!book) return <div className="page"><p className="muted">Không tìm thấy sách.</p></div>;

  return (
    <div className="page">
      <Link to="/books" className="text-sm muted" style={{ display: 'inline-block', marginBottom: '20px' }}>← Quay lại danh sách</Link>
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {!imageFailed && book.imageUrl ? (
          <img src={resolveImageUrl(book.imageUrl)} alt={book.title} onError={() => setImageFailed(true)} style={{ width: '280px', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }} />
        ) : <div className="detail-cover"><FallbackCover book={book} /></div>}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <span className="book-card-genre">{book.genre}</span>
          <h1 style={{ fontSize: '1.8rem', margin: '6px 0' }}>{book.title}</h1>
          <p className="muted">Tác giả: {book.author}</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, margin: '14px 0' }}>{book.price.toLocaleString('vi-VN')} đ</p>
          <p style={{ maxWidth: '480px', color: 'var(--color-text-muted)' }}>{book.description}</p>
          <p className="text-sm muted" style={{ marginTop: '8px' }}>Còn lại: {book.stock} cuốn</p>
          <button onClick={handleAdd} className="btn btn-primary" style={{ marginTop: '16px' }}>
            {added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
