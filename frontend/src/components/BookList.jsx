import BookCard from './BookCard';

const BookList = ({ books, onDelete }) => {
  if (!books || books.length === 0) {
    return <p>Không tìm thấy sách nào phù hợp.</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
      {books.map((book) => (
        <BookCard key={book.id} book={book} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default BookList;
