import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import { commerceApi } from '../api/commerceApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/useAuth';
import { resolveImageUrl } from '../api/axiosClient';
import { FallbackCover } from '../components/BookCard';

export default function BookDetailPage() {
  const { id } = useParams(); const { addToCart } = useCart(); const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null); const [reviews, setReviews] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [content, setContent] = useState(''); const [rating, setRating] = useState(5);
  const load = () => { setLoading(true); Promise.all([booksApi.getById(id), commerceApi.reviews(id)]).then(([b, r]) => { setBook(b); setReviews(r); }).catch(() => setError('Không tải được thông tin sách.')).finally(() => setLoading(false)); };
  useEffect(load, [id]);
  const save = async () => { if (!isAuthenticated) return setNotice('Hãy đăng nhập để lưu sách yêu thích.'); try { await commerceApi.addWishlist(id); setNotice('Đã lưu vào danh sách yêu thích.'); } catch { setNotice('Không thể lưu sách lúc này.'); } };
  const review = async (event) => { event.preventDefault(); try { await commerceApi.review(id, { rating: Number(rating), content }); setContent(''); setNotice('Đã gửi đánh giá.'); load(); } catch (e) { setNotice(e.response?.data?.detail || 'Không thể gửi đánh giá.'); } };
  if (loading) return <div className="page"><p className="muted">Đang tải...</p></div>;
  if (error || !book) return <div className="page"><div className="alert alert-error">{error || 'Không tìm thấy sách.'}</div></div>;
  return <div className="page"><Link to="/books" className="text-sm muted">← Quay lại danh sách</Link><div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 20 }}><div>{book.imageUrl ? <img src={resolveImageUrl(book.imageUrl)} onError={(e) => { e.currentTarget.style.display = 'none'; }} alt={book.title} style={{ width: 280, aspectRatio: '3/4', objectFit: 'cover', borderRadius: '12px' }} /> : <FallbackCover book={book} />}</div><div style={{ flex: 1, minWidth: 260 }}><span className="book-card-genre">{book.genre}</span><h1>{book.title}</h1><p className="muted">Tác giả: {book.author}</p><p style={{ fontSize: '1.6rem', fontWeight: 700 }}>{book.price.toLocaleString('vi-VN')} đ</p><p>{book.description}</p><p className="muted">Còn lại: {book.stock} cuốn</p><button className="btn btn-primary" disabled={book.stock <= 0} onClick={() => addToCart(book, 1)}>Thêm vào giỏ</button><button className="btn btn-outline" onClick={save} style={{ marginLeft: 10 }}>♡ Lưu yêu thích</button>{notice && <p className="text-sm muted">{notice}</p>}</div></div><section className="card" style={{ marginTop: 32, padding: 24 }}><h2>Đánh giá từ độc giả</h2>{reviews.length ? reviews.map((r) => <article key={r.id} style={{ borderTop: '1px solid #e5e7eb', padding: '12px 0' }}><b>{r.author_name}</b> · {'★'.repeat(r.rating)}<p>{r.content}</p></article>) : <p className="muted">Chưa có đánh giá nào.</p>}{isAuthenticated && <form onSubmit={review}><select value={rating} onChange={(e) => setRating(e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}</select><textarea required minLength="3" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn" style={{ display: 'block', width: '100%', minHeight: 80, margin: '8px 0' }} /><button className="btn btn-primary">Gửi đánh giá</button></form>}</section></div>;
}
