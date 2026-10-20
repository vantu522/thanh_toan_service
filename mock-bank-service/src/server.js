import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { bankRepository } from './repositories/bank.repository.js';

// Khởi tạo HTTP server
const server = http.createServer(app);

// Cấu hình thời gian giữ kết nối nhàn rỗi (keep-alive) tối đa 5 giây theo yêu cầu Lab 3
server.keepAliveTimeout = 5000;

// Lắng nghe sự kiện kết nối TCP mới:
// "connections là số kết nối TCP mới nhận" và "in log mỗi khi có kết nối TCP mới"
server.on('connection', (socket) => {
  bankRepository.incrementConnections();
  console.log(`[Mock Bank TCP] Nhận kết nối TCP mới. (Tổng kết nối: ${socket.server._connections || 'đang mở'})`);
});

server.listen(env.PORT, () => {
  console.log(`[Mock Bank Service] Đang chạy tại cổng ${env.PORT}`);
  console.log(`[Mock Bank Service] Cấu hình mô phỏng: DELAY_MS=${env.DELAY_MS}, FAIL_RATE=${env.FAIL_RATE}, DROP_RATE=${env.DROP_RATE}`);
  console.log(`[Mock Bank Service] Keep-Alive Timeout: 5000ms`);
});

// Xử lý graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Mock Bank Service] Nhận tín hiệu SIGTERM. Đang dừng server...');
  server.close(() => {
    console.log('[Mock Bank Service] Server đã dừng hoàn tất.');
    process.exit(0);
  });
});
