# 🌱 La Bàn Tuổi 15

> **"Hiểu mình – Hiểu nghề – Hiểu người – Chọn tương lai."**

Nền tảng giáo dục hướng nghiệp dành cho học sinh lớp 9, được giáo viên chủ nhiệm sử dụng để hỗ trợ học sinh khám phá bản thân, khám phá nghề nghiệp, theo dõi cảm xúc và phát triển toàn diện.

---

## 🚀 Khởi động nhanh

### Cách 1: Chạy file `start.bat`
```
Double-click vào file: start.bat
```
Website sẽ tự động mở tại http://localhost:5173

### Cách 2: Chạy thủ công

**Terminal 1 – Backend:**
```powershell
$env:PATH = "C:\nodejs;" + $env:PATH
cd backend
npx ts-node --transpile-only src/index.ts
```

**Terminal 2 – Frontend:**
```powershell
$env:PATH = "C:\nodejs;" + $env:PATH
cd frontend
npm run dev
```

---

## 👤 Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
|---------|---------------|----------|
| 🌱 Học sinh | `hocsinh01` → `hocsinh10` | `Demo@123` |
| 👩‍🏫 Giáo viên | `giaovien` | `Demo@123` |
| ⚙️ Admin | `admin` | `Admin@123` |

**Mã lớp:** `LBT15-9A1`

---

## 🌐 Địa chỉ

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/api/health

---

## 📋 Tính năng đầy đủ

### Học sinh
- ✅ **Dashboard** – Tổng quan XP, streak, thử thách
- ✅ **Khám phá bản thân** – RIASEC, điểm mạnh, giá trị sống
- ✅ **Thế giới nghề nghiệp** – 20+ nghề với mini-challenge
- ✅ **Lumi AI** – Chatbot tư vấn bằng tiếng Việt
- ✅ **Hành trình 21 ngày** – Thử thách tự phát triển
- ✅ **Mục tiêu** – Đặt và theo dõi mục tiêu SMART
- ✅ **Nhật ký** – Viết nhật ký cá nhân
- ✅ **Cảm xúc** – Check-in hàng ngày
- ✅ **Góc tâm sự** – Chia sẻ với giáo viên + nút 🆘 khẩn cấp
- ✅ **Góc lớp học** – Xem thông báo từ giáo viên
- ✅ **Hồ sơ** – XP, badges, kết quả đánh giá

### Giáo viên
- ✅ **Tổng quan lớp** – Thống kê toàn lớp
- ✅ **Theo dõi học sinh** – Tiến độ từng học sinh
- ✅ **Xử lý tâm sự** – Phản hồi yêu cầu hỗ trợ
- ✅ **Thống kê** – Biểu đồ cảm xúc, top nghề

### Admin
- ✅ **Thống kê hệ thống** – Tổng quan tất cả users
- ✅ **Quản lý người dùng** – Kích hoạt/vô hiệu hóa

---

## 🏗️ Kiến trúc

```
la-ban-tuoi-15/
├── backend/          # Node.js + Express + TypeScript + Prisma
│   ├── prisma/       # Schema SQLite + seed data
│   └── src/
│       ├── routes/   # 16 route files
│       └── middleware/
├── frontend/         # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── pages/    # 15+ page components
│       ├── components/
│       └── store/    # Zustand state
└── start.bat         # Script khởi động
```

---

## 🔒 Bảo mật

- JWT Authentication
- Role-based access control (STUDENT/TEACHER/ADMIN)
- Safety keyword detection trong Lumi AI
- Hệ thống báo khẩn cấp → thông báo ngay giáo viên

---

## 🤖 Cấu hình Gemini AI (tùy chọn)

Để dùng AI thật thay vì Mock:

1. Lấy API key tại https://aistudio.google.com
2. Mở file `backend/.env`
3. Thêm: `GEMINI_API_KEY=your_key_here`
4. Khởi động lại backend

---

*Xây dựng với ❤️ cho học sinh lớp 9 Việt Nam*
