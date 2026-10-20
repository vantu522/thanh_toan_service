import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Đảm bảo luôn tìm thấy file .env của mock-bank-service dù chạy từ bất kỳ thư mục nào
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

/**
 * Kiểm tra và chuẩn hóa cấu hình biến môi trường của Mock Bank Service.
 */
function validateEnv() {
  const port = parseInt(process.env.PORT || '4002', 10);
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`[Bank Config Error] PORT không hợp lệ: "${process.env.PORT}". Phải là số nguyên từ 1 đến 65535.`);
  }

  const delayMs = parseInt(process.env.DELAY_MS || '0', 10);
  if (Number.isNaN(delayMs) || delayMs < 0) {
    throw new Error(`[Bank Config Error] DELAY_MS không hợp lệ: "${process.env.DELAY_MS}". Phải là số nguyên >= 0.`);
  }

  const failRate = parseFloat(process.env.FAIL_RATE || '0');
  if (Number.isNaN(failRate) || failRate < 0 || failRate > 1) {
    throw new Error(`[Bank Config Error] FAIL_RATE không hợp lệ: "${process.env.FAIL_RATE}". Phải là số thực từ 0.0 đến 1.0.`);
  }

  const dropRate = parseFloat(process.env.DROP_RATE || '0');
  if (Number.isNaN(dropRate) || dropRate < 0 || dropRate > 1) {
    throw new Error(`[Bank Config Error] DROP_RATE không hợp lệ: "${process.env.DROP_RATE}". Phải là số thực từ 0.0 đến 1.0.`);
  }

  return {
    PORT: port,
    DELAY_MS: delayMs,
    FAIL_RATE: failRate,
    DROP_RATE: dropRate
  };
}

export const env = validateEnv();
