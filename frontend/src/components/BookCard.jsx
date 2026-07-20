import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';

const BookCard = ({ book, onDelete }) => {
  const { addToCart } = useCart();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', width: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <img src={book.imageUrl} alt={book.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
      <h3 style={{ margin: '4px 0', fontSize: '1rem' }}>{book.title}</h3>
      <p style={{ margin: 0, color: '#757575', fontSize: '0.9rem' }}>{book.author}</p>
      <p style={{ margin: 0, color: '#999', fontSize: '0.8rem' }}>{book.genre}</p>
      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{book.price.toLocaleString('vi-VN')} đ</p>

      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
        <Link to={`/books/${book.id}`} style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#eee', borderRadius: '4px', textDecoration: 'none', color: '#333' }}>
          Chi tiết
        </Link>
        <button onClick={() => addToCart(book, 1)} style={{ flex: 1, padding: '8px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Thêm giỏ
        </button>
      </div>

      {isAdmin && onDelete && (
        <button onClick={() => onDelete(book.id)} style={{ marginTop: '4px', padding: '6px', backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Xóa
        </button>
      )}
    </div>
  );
};

export default BookCard;
