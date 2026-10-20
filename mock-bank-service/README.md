# Mock Bank Service

Service giả lập cổng thanh toán ngân hàng phục vụ bài thực hành kiến trúc thanh toán phân tán.

## Vai trò kiến trúc
- **Port:** `4002`
- **Lưu trữ dữ liệu:** Lưu trữ cục bộ trong bộ nhớ bằng `Map` (`local in-memory store`), không dùng database ngoài.
- **Trách nhiệm:**
  - Cung cấp API trừ tiền (`POST /charges`) với hạn mức tối đa `20.000.000đ`.
  - Hỗ trợ header `Idempotency-Key` nhằm chống trừ tiền trùng lặp (duplicate charges).
  - Cung cấp API thống kê chỉ số (`GET /stats`) bao gồm:
    - `connections`: Số lượng TCP connection mới được khởi tạo.
    - `requests`: Tổng số HTTP request gửi đến service.
    - `charges`: Số lượng giao dịch trừ tiền thành công.
    - `duplicates`: Số lượng yêu cầu bị trùng Idempotency-Key.
  - Sẵn sàng tích hợp cơ chế mô phỏng trễ mạng (`DELAY_MS`), lỗi máy chủ (`FAIL_RATE`), và ngắt kết nối đột ngột (`DROP_RATE`).

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
- `PORT`: Cổng dịch vụ (mặc định: `4002`).
- `DELAY_MS`: Độ trễ mạng giả lập tính bằng mili-giây (mặc định: `0`).
- `FAIL_RATE`: Tỷ lệ ném lỗi HTTP 500 giả lập (từ `0` đến `1`, mặc định: `0`).
- `DROP_RATE`: Tỷ lệ ngắt kết nối socket đột ngột (từ `0` đến `1`, mặc định: `0`).
