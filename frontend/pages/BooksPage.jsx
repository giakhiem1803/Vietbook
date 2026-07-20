import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { booksApi } from '../api/booksApi';
import BookList from '../components/BookList';
import { useAuth } from '../auth/useAuth';
const GENRES = ['All', 'Fiction', 'Non-fiction', 'Manga', 'Self-help', 'Kids'];
const BooksPage = () => {
  const [books, setBooks] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [searchTerm, setSearchTerm] = useState(''); const [genre, setGenre] = useState('All'); const [sortOption, setSortOption] = useState('none');
  const { role } = useAuth(); const isAdmin = role === 'ADMIN';
  useEffect(() => { const fetchBooks = async () => { setLoading(true); setError(''); try { const params = {}; if (searchTerm.trim()) params.search = searchTerm.trim(); if (genre !== 'All') params.genre = genre; setBooks(await booksApi.getAll(params)); } catch { setError('Không tải được danh sách sách. Hãy kiểm tra backend đang chạy.'); } finally { setLoading(false); } }; const timer = setTimeout(fetchBooks, 300); return () => clearTimeout(timer); }, [searchTerm, genre]);
  const sortedBooks = [...books].sort((a, b) => sortOption === 'price-asc' ? a.price - b.price : sortOption === 'price-desc' ? b.price - a.price : 0);
  return <div className="page catalog-page"><section className="catalog-intro"><div><span className="eyebrow">KHÁM PHÁ TỦ SÁCH</span><h2>Những cuốn sách dành cho bạn</h2><p>Từ những câu chuyện chạm đến trái tim đến tri thức mở ra chân trời mới.</p></div>{isAdmin && <Link to="/admin/books/new" className="btn btn-primary">+ Thêm sách mới</Link>}</section><section className="catalog-toolbar card"><label className="search-field"><span>⌕</span><input type="search" placeholder="Tìm tên sách hoặc tác giả..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label><div className="genre-pills">{GENRES.map((item) => <button key={item} className={genre === item ? 'active' : ''} onClick={() => setGenre(item)}>{item === 'All' ? 'Tất cả' : item}</button>)}</div><select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="catalog-sort"><option value="none">Sắp xếp mặc định</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option></select></section><div className="catalog-result"><span>{loading ? 'Đang tìm sách...' : `${sortedBooks.length} đầu sách được tìm thấy`}</span>{genre !== 'All' && <button onClick={() => setGenre('All')}>Xóa bộ lọc ×</button>}</div>{error && <div className="alert alert-error">{error}</div>}{!loading && !error && <BookList books={sortedBooks} />}</div>;
};
export default BooksPage;
