import { useEffect, useState } from 'react';
import { commerceApi } from '../api/commerceApi';
import { booksApi } from '../api/booksApi';
import BookList from '../components/BookList';
export default function WishlistPage() {
  const [books, setBooks] = useState([]); const [error, setError] = useState('');
  useEffect(() => { Promise.all([commerceApi.wishlist(), booksApi.getAll()]).then(([wish, all]) => setBooks(all.filter((b) => wish.some((x) => x.book_id === b.id)))).catch(() => setError('Không tải được danh sách yêu thích.')); }, []);
  return <div className="page"><h1 className="section-title">Sách yêu thích</h1>{error ? <div className="alert alert-error">{error}</div> : books.length ? <BookList books={books} /> : <p className="muted">Bạn chưa lưu cuốn sách nào.</p>}</div>;
}
