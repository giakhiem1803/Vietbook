import BookCard from './BookCard';

const BookList = ({ books }) => {
  if (!books || books.length === 0) {
    return <div className="empty-state">Không tìm thấy sách nào phù hợp.</div>;
  }

  return (
    <div className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
};

export default BookList;
