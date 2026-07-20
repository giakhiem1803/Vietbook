import { useEffect, useState } from 'react';
import { booksApi } from '../api/booksApi';
import BookList from '../components/BookList';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

const GENRES = ['All', 'Fiction', 'Non-fiction', 'Manga', 'Self-help', 'Kids'];

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('All');
  const [sortOption, setSortOption] = useState('none');

  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (genre !== 'All') params.genre = genre;
        const data = await booksApi.getAll(params);
        setBooks(data);
      } catch (err) {
        setError('Không tải được danh sách sách. Kiểm tra backend đã chạy chưa?');
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, genre]);

  const sortedBooks = [...books].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    return 0;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa cuốn sách này?')) return;
    try {
      await booksApi.delete(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('Xóa thất bại. Bạn có phải ADMIN không?');
    }
  };

  return (
    <section style={{ padding: '24px' }}>
      <h2>Danh mục sách</h2>

      {isAdmin && (
        <button onClick={() => navigate('/admin/books/new')} style={{ marginBottom: '12px', padding: '8px 14px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          + Thêm sách mới
        </button>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Tìm theo tên sách / tác giả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', minWidth: '220px' }}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: '8px' }}>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} style={{ padding: '8px' }}>
          <option value="none">Sắp xếp: mặc định</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
        </select>
      </div>

      {loading && <p>Đang tải sách...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <p style={{ color: '#555' }}>Hiển thị {sortedBooks.length} cuốn sách</p>
          <BookList books={sortedBooks} onDelete={isAdmin ? handleDelete : null} />
        </>
      )}
    </section>
  );
};

export default BooksPage;
