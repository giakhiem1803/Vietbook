import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';
import { resolveImageUrl } from '../api/axiosClient';

const BookCard = ({ book }) => {
  const { addToCart } = useCart();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  return <article className="book-card">
    <Link to={`/books/${book.id}`} className="book-cover-wrap"><img src={resolveImageUrl(book.imageUrl)} alt={`Bìa sách ${book.title}`} className="book-card-img" /><span className="book-genre-chip">{book.genre}</span></Link>
    <div className="book-card-body"><p className="book-card-author">{book.author}</p><Link to={`/books/${book.id}`} className="book-card-title">{book.title}</Link><div className="book-price-row"><span className="book-card-price">{book.price.toLocaleString('vi-VN')} đ</span><span className="stock-label">{book.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></div><div className="book-card-actions">{isAdmin ? <Link to={`/admin/books/${book.id}/edit`} className="btn btn-outline btn-sm btn-block">Quản lý sách</Link> : <button onClick={() => addToCart(book, 1)} disabled={book.stock <= 0} className="btn btn-primary btn-sm btn-block">Thêm vào giỏ +</button>}</div></div>
  </article>;
};
export default BookCard;
