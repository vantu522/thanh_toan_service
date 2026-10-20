import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Đảm bảo luôn tìm thấy file .env của fee-service dù chạy từ bất kỳ thư mục nào
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

/**
 * Kiểm tra và chuẩn hóa cấu hình biến môi trường của Fee Service theo Lab 3
 */
function validateEnv() {
  const port = parseInt(process.env.PORT || '4001', 10);
  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`[Fee Service Config Error] PORT không hợp lệ: "${process.env.PORT}". Phải là số từ 1 đến 65535.`);
  }

  // Ưu tiên BANK_URL theo đúng đề bài Lab 3
  const bankUrl = process.env.BANK_URL || process.env.BANK_BASE_URL || 'http://localhost:4002';
  try {
    new URL(bankUrl);
  } catch (err) {
    throw new Error(`[Fee Service Config Error] BANK_URL không hợp lệ: "${bankUrl}". Cần có định dạng URL hợp lệ.`);
  }

  // Thời gian chờ tối đa khi gọi ngân hàng (mặc định 4000ms để đảm bảo luôn <= 4.5 giây theo Tình huống 2)
  const bankTimeoutMs = parseInt(process.env.BANK_TIMEOUT_MS || '4000', 10);

  return {
    PORT: port,
    BANK_URL: bankUrl,
    BANK_TIMEOUT_MS: bankTimeoutMs
  };
}

export const env = validateEnv();
