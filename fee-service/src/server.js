import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => {
  console.log(`[Fee Service] Đang chạy tại: http://localhost:${env.PORT}`);
  console.log(`[Fee Service] Kết nối Mock Bank tại: ${env.BANK_BASE_URL}`);
});

// Xử lý graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Fee Service] Nhận tín hiệu SIGTERM. Đang dừng server...');
  server.close(() => {
    console.log('[Fee Service] Server đã dừng hoàn tất.');
    process.exit(0);
  });
});
