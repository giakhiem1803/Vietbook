"""
Chay file nay MOT LAN de tao du lieu mau:
    python seed.py
"""
from database import SessionLocal, engine, Base
from models.book import BookDB
from models.user import UserDB
from auth.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- Seed books ---
if db.query(BookDB).count() == 0:
    books = [
        BookDB(title="Doraemon Tap 1", author="Fujiko F. Fujio", price=25000, genre="Manga",
               description="Chu meo may Doraemon den tu tuong lai giup do Nobita.",
               image_url="https://covers.openlibrary.org/b/isbn/9784091400017-L.jpg", stock=20),
        BookDB(title="Nha Gia Kim", author="Paulo Coelho", price=79000, genre="Fiction",
               description="Hanh trinh di tim kho bau va y nghia cuoc song cua chang chan cuu Santiago.",
               image_url="https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg", stock=15),
        BookDB(title="Dac Nhan Tam", author="Dale Carnegie", price=86000, genre="Self-help",
               description="Nghe thuat doi nhan xu the va thu phuc long nguoi kinh dien.",
               image_url="https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg", stock=30),
        BookDB(title="Sherlock Holmes: Toan Tap", author="Arthur Conan Doyle", price=150000, genre="Fiction",
               description="Bo suu tap tron ven cac vu an trinh tham lung danh cua Sherlock Holmes.",
               image_url="https://covers.openlibrary.org/b/isbn/9780140439074-L.jpg", stock=10),
        BookDB(title="Tuoi Tho Du Doi", author="Phung Quan", price=65000, genre="Fiction",
               description="Cau chuyen ve nhung thieu nien trinh sat tren chien truong Hue.",
               image_url="https://covers.openlibrary.org/b/isbn/9786047751389-L.jpg", stock=12),
        BookDB(title="One Piece Tap 1", author="Eiichiro Oda", price=22000, genre="Manga",
               description="Hanh trinh tro thanh vua hai tac cua Luffy va bang hai tac Mu Rom.",
               image_url="https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg", stock=25),
        BookDB(title="Nhung Tam Long Cao Ca", author="Edmondo De Amicis", price=58000, genre="Kids",
               description="Nhat ky cua cau be Enrico ve tinh ban, tinh thay tro va long nhan ai.",
               image_url="https://covers.openlibrary.org/b/isbn/9780192834938-L.jpg", stock=18),
        BookDB(title="Tu Duy Nhanh Va Cham", author="Daniel Kahneman", price=189000, genre="Non-fiction",
               description="Kham pha hai he thong tu duy chi phoi moi quyet dinh cua con nguoi.",
               image_url="https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg", stock=8),
        BookDB(title="Conan Tap 1", author="Gosho Aoyama", price=20000, genre="Manga",
               description="Tham tu hoc sinh Conan Edogawa pha an voi tri tue sieu pham.",
               image_url="https://covers.openlibrary.org/b/isbn/9781591163278-L.jpg", stock=22),
        BookDB(title="Nha Lanh Dao Khong Chuc Danh", author="Robin Sharma", price=99000, genre="Self-help",
               description="Bai hoc ve tinh than lanh dao trong cong viec va cuoc song.",
               image_url="https://covers.openlibrary.org/b/isbn/9781439109137-L.jpg", stock=14),
    ]
    db.add_all(books)
    print(f"Da them {len(books)} cuon sach mau.")
else:
    print("Books da co du lieu, bo qua seed sach.")

# --- Seed admin account ---
if not db.query(UserDB).filter(UserDB.email == "admin@vietbook.com").first():
    admin = UserDB(
        email="admin@vietbook.com",
        full_name="Admin Vietbook",
        password_hash=hash_password("admin123"),
        role="ADMIN",
    )
    db.add(admin)
    print("Da tao tai khoan ADMIN: admin@vietbook.com / admin123")
else:
    print("Admin da ton tai, bo qua.")

db.commit()
db.close()
print("Seed xong!")
