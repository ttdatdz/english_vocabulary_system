# Ứng dụng Học Từ Vựng Tiếng Anh Online (Frontend)
Một ứng dụng web hỗ trợ học từ vựng tiếng Anh và luyện thi TOEIC thông qua phương pháp flashcard và các bài thi thử, giúp người học ghi nhớ hiệu quả và cải thiện kỹ năng làm bài.
## Nhóm Thực Hiện
- **Văn Đại**: Trưởng nhóm, tích hợp API cho phía client.
- **Tiến Đạt**: Thành viên, thiết kế FE và tích hợp API.

## Mục lục

- Giới thiệu
- Mục tiêu
- Tính năng
- Công nghệ sử dụng
- Yêu cầu hệ thống
- Hướng dẫn cài đặt
- Cấu trúc thư mục
- Liên hệ


## Giới Thiệu
Ứng dụng Học Từ Vựng Tiếng Anh Online (Frontend) là một nền tảng web giúp người học tiếng Anh, đặc biệt là những người chuẩn bị thi TOEIC. Sử dụng flashcard với kỹ thuật lặp lại ngắt quãng (spaced repetition) và các bài thi thử, ứng dụng mang đến trải nghiệm học tập trực quan, hiệu quả. Dự án tích hợp với Backend qua API, hỗ trợ quản lý nội dung và dữ liệu người dùng một cách chuyên nghiệp.

## Mục Tiêu
- Cung cấp giao diện thân thiện, trực quan cho người học.
- Hỗ trợ học từ vựng và luyện thi TOEIC hiệu quả, tiết kiệm thời gian.
- Cá nhân hóa lộ trình học và theo dõi tiến trình.
- Đảm bảo tích hợp mượt mà với Backend qua API.
- Xây dựng nền tảng mở rộng cho các tính năng tương lai.

## Tính Năng
- **Phía Khách Hàng:**
  - Học từ vựng: Sử dụng flashcard để ghi nhớ từ vựng theo chủ đề và cấp độ.
  - Luyện thi TOEIC: Cung cấp các bài thi thử mô phỏng đề thi thực tế
  - Trao đổi, bình luận về đề thi toeic
  - Đánh giá trải nghiệm khi sử dụng hệ thống.
  - Xem các bài blog của hệ thống

- **Phía Admin:**
  - Thống kê báo cáo feedback, số lượt thi,...vv.
  - Quản lý người dùng.
  - Quản lý đề thi toiec.
  - Quản lý bài blog
  - Quản lý danh mục đề thi, bài blog
  - Quản lý đánh giá từ người dùng.


## Công nghệ Được Sử Dụng
- **Frontend:** React, SCSS, JavaScript, Ant Design.
- **Công cụ phụ trợ:** Fetch (gọi API), Redux (quản lý trạng thái), React Router (điều hướng)

## Yêu Cầu Hệ Thống
- Trình duyệt hỗ trợ HTML5 và JavaScript.
- Môi trường phát triển: Node.js v16.0 trở lên
- Backend API: Yêu cầu kết nối với Backend (được triển khai riêng)

## Hướng Dẫn Cài Đặt
1. Clone repository:
   ```bash
   git clone https://github.com/VuBinhVL/SE100_WebsiteQuanLyPhongMachTu.git
   ```
2. Cài đặt các thư viện yêu cầu:
   
   ```bash
   npm install
   ```

3. Khởi động frontend:
   ```bash
   npm start
   ```
4. Truy cập tại http://localhost:3000


## 📁 Cấu trúc thư mục

```bash
src/
├── assets/          # Ảnh, icon
├── components/      # Component dùng chung
├── services/        # API service
├── hooks/           # Custom hooks
├── layouts/         # Giao diện layout
├── pages/            # Các trang (Home, Vocabulary, TOEIC Test)
├── styles/          # SCSS global, mixin, biến
├── public/          # Tài nguyên công khai (favicon, index.html)
├── utils/           # Hàm tiện ích (helper functions, formatters)
├── store/           # Quản lý trạng thái (Redux/Redux Toolkit)
├── routes/          # Định nghĩa các routes
├── App.js
└── index.js
```
## Liên hệ
- Email: trandat2622004@gmail.com


