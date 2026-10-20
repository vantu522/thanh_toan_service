# Bài Thực Hành Thiết Kế Hệ Thống Thanh Toán Phân Tán (Distributed Payment System)

Dự án gồm hai service độc lập mô phỏng kiến trúc thanh toán phân tán giữa hệ thống Quản lý học phí (Fee Service) và Cổng thanh toán ngân hàng (Mock Bank Service).

Toàn bộ dữ liệu được lưu trữ cục bộ trong bộ nhớ bằng JavaScript `Map` (local in-memory store), không cần cài đặt hay kết nối cơ sở dữ liệu bên ngoài.

---

## 1. Cấu Trúc Tổng Thể Dự Án

```
payment/
├── .gitignore
├── README.md
├── fee-service/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── clients/
│       │   └── bank.client.js
│       ├── config/
│       │   └── env.js
│       ├── controllers/
│       │   └── fee.controller.js
│       ├── middleware/
│       │   └── error.middleware.js
│       ├── repositories/
│       │   └── fee.repository.js
│       ├── routes/
│       │   └── fee.routes.js
│       ├── services/
│       │   └── fee.service.js
│       └── store/
│           └── memory.store.js
│
└── mock-bank-service/
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── README.md
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        │   └── env.js
        ├── controllers/
        │   └── bank.controller.js
        ├── middleware/
        │   └── error.middleware.js
        ├── repositories/
        │   └── bank.repository.js
        ├── routes/
        │   └── bank.routes.js
        ├── services/
        │   └── bank.service.js
        └── store/
            └── memory.store.js
```

---

## 2. Hướng Dẫn Cài Đặt & Chạy Hai Service

Cả hai service đều dùng Node.js (>= 18), Express và ES Modules (`"type": "module"`), dependencies chỉ gồm `express` và `dotenv`.

### Bước 1: Cài đặt dependencies cho từng service

Mở 2 cửa sổ terminal riêng biệt:

**Terminal 1 (Mock Bank Service):**
```bash
cd mock-bank-service
npm install
npm run dev
```
Mock Bank Service sẽ chạy tại: `http://localhost:4002`.
- Giao diện Swagger UI: `http://localhost:4002/api-docs`

**Terminal 2 (Fee Service):**
```bash
cd fee-service
npm install
npm run dev
```
Fee Service sẽ chạy tại: `http://localhost:4001`.
- Giao diện Swagger UI: `http://localhost:4001/api-docs`

---

## 3. Danh Sách API & Giao Diện Swagger Test

Cả hai service đều được tích hợp sẵn Swagger UI trực quan giúp test API trực tiếp trên trình duyệt mà không cần cài thêm Postman:
- **Fee Service Swagger:** [http://localhost:4001/api-docs](http://localhost:4001/api-docs)
- **Mock Bank Swagger:** [http://localhost:4002/api-docs](http://localhost:4002/api-docs)

### Fee Service (Port 4001)
- `GET /api-docs`: Giao diện Swagger UI tương tác
- `GET /health`: Kiểm tra sức khỏe service
- `GET /students/:id/fees`: Tra cứu công nợ sinh viên (Lưu cục bộ trong `Map`)
  - Sinh viên 1: Nợ `50.000.000đ`
  - Sinh viên 2: Nợ `0đ`
  - Sinh viên 3: Nợ `3.200.000đ`
- `POST /students/:id/payments`: Tiếp nhận yêu cầu thanh toán học phí

### Mock Bank Service (Port 4002)
- `GET /api-docs`: Giao diện Swagger UI tương tác
- `GET /health`: Kiểm tra sức khỏe service
- `POST /charges`: Xử lý giao dịch trừ tiền
  - Header: `Idempotency-Key` (bắt buộc)
  - Body: `{ "reference": "...", "amount": 1000000 }`
  - Giới hạn: Tối đa `20.000.000đ` / giao dịch
- `GET /stats`: Thống kê hệ thống
  - `connections`: Số lượng TCP connection mới
  - `requests`: Tổng số HTTP request
  - `charges`: Số lượng giao dịch thành công
  - `duplicates`: Số lượng yêu cầu trùng lặp
