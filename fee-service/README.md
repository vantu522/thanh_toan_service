# Fee Service

Service phụ trách quản lý công nợ học phí của sinh viên và điều phối giao dịch thanh toán thông qua Mock Bank Service.

## Vai trò kiến trúc
- **Port:** `4001`
- **Lưu trữ dữ liệu:** Lưu trữ cục bộ trong bộ nhớ bằng `Map` (`local in-memory store`), không dùng database ngoài.
- **Trách nhiệm:**
  - Tra cứu công nợ sinh viên (`GET /students/:id/fees`).
  - Tiếp nhận yêu cầu thanh toán (`POST /students/:id/payments`).
  - Gọi Mock Bank Service thông qua HTTP Client (`src/clients/bank.client.js`).
  - Đảm bảo tính toán công nợ an toàn, sẵn sàng cho các tình huống phân tán: Timeout, Retry, Idempotency, trạng thái UNKNOWN.

## Cài đặt & Khởi chạy

1. Cài đặt dependencies:
   ```bash
   npm install
   ```

2. Tạo file biến môi trường (nếu chưa có):
   ```bash
   cp .env.example .env
   ```

3. Chạy ở môi trường phát triển:
   ```bash
   npm run dev
   ```

4. Chạy ở môi trường sản xuất:
   ```bash
   npm start
   ```

## Biến môi trường
- `PORT`: Cổng dịch vụ lắng nghe (mặc định: `4001`).
- `BANK_BASE_URL`: Địa chỉ của Mock Bank Service (mặc định: `http://localhost:4002`).
