const Footer = ({ studentName = 'Student', courseName = 'Full-Stack Web Development' }) => {
  return (
    <footer className="site-footer">
      © {new Date().getFullYear()} Vietbook · {studentName} · {courseName}
    </footer>
  );
};

export default Footer;
