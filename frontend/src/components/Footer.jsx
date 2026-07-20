const Footer = ({ studentName = 'Student', courseName = 'Full-Stack Web Development' }) => {
  return (
    <footer style={{ padding: '16px 24px', borderTop: '1px solid #ddd', marginTop: '32px', color: '#777' }}>
      <p>© {new Date().getFullYear()} Vietbook</p>
      <p>Student: {studentName}</p>
      <p>Course: {courseName}</p>
    </footer>
  );
};

export default Footer;
