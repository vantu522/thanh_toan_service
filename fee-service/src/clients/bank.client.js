import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/payment.constants.js';

/**
 * Bank Client - Giao tiếp HTTP với Mock Bank Service
 * Tích hợp cơ chế Retry an toàn theo chuẩn Lab 3 (Tình huống 4):
 * - Tự động thử lại khi gặp lỗi tạm thời (500 FAIL_RATE) hoặc đứt mạng/timeout (DROP_RATE)
 * - GIỮ NGUYÊN Idempotency-Key và Reference khi Retry
 * - TUYỆT ĐỐI KHÔNG thử lại khi gặp lỗi từ chối nghiệp vụ (402 vượt hạn mức, 400)
 * - Khống chế thời gian toàn bộ các lần thử <= 4.5 giây
 */
class BankClient {
  constructor(baseUrl = env.BANK_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Gọi API POST /charges kèm cơ chế Retry
   * 
   * @param {object} params
   * @param {string} params.idempotencyKey
   * @param {string} params.reference
   * @param {number} params.amount
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async charge({ idempotencyKey, reference, amount }, options = {}) {
    const url = `${this.baseUrl}/charges`;
    const maxRetries = 2; // Thử tối đa 2 lần retry (tổng cộng 3 lần gọi)
    const timeoutPerAttempt = 1200; // 1.2s mỗi lần
    const retryDelay = 150; // Chờ 150ms giữa các lần thử lại

    let lastError;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`[Fee Service -> Mock Bank] POST /charges (Lan ${attempt}/${maxRetries + 1}) | Key: "${idempotencyKey}" | Ref: "${reference}"`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify({ reference, amount }),
          signal: AbortSignal.timeout(timeoutPerAttempt)
        });

        const data = await response.json().catch(() => ({}));

        // 1. Nếu là lỗi từ chối 4xx (402 vượt hạn mức, 400 không hợp lệ):
        // KHÔNG THỬ LẠI LỖI BỊ TỪ CHỐI
        if (response.status >= 400 && response.status < 500) {
          console.warn(`[Fee Service] Ngan hang tu choi ro rang [HTTP ${response.status}]: ${data.error?.message || data.message}. KHONG THU LAI.`);
          const err = new Error(data.error?.message || data.message || 'Ngan hang tu choi giao dich');
          err.status = response.status;
          err.isNonRetryable = true;
          throw err;
        }

        // 2. Nếu là lỗi máy chủ 500 tạm thời (FAIL_RATE):
        if (response.status >= 500) {
          console.warn(`[Fee Service] Ngan hang bao loi [HTTP ${response.status}] tam thoi (FAIL_RATE). Chuan bi thu lai...`);
          const err = new Error(data.error?.message || data.message || 'Loi he thong ngan hang tam thoi');
          err.status = response.status;
          throw err;
        }

        // 3. Thành công (HTTP 200 / 201)
        console.log(`[Fee Service <- Mock Bank] Thanh cong o lan ${attempt}. (ChargeId: ${data.chargeId}, Duplicate: ${data.isDuplicate})`);
        return data;

      } catch (err) {
        lastError = err;

        // Nếu là lỗi từ chối không thể retry (402, 400), ném ra ngay lập tức
        if (err.isNonRetryable || (err.status >= 400 && err.status < 500)) {
          throw err;
        }

        // Nếu đã hết số lần retry tối đa
        if (attempt > maxRetries) {
          console.error(`[Fee Service] Da het ${maxRetries + 1} lan thu lai ma van khong thanh cong.`);
          break;
        }

        console.log(`[Fee Service Retry] Mang dut hoac loi 500. Thu lai lan ${attempt + 1} sau ${retryDelay}ms... (Giu nguyen Key: ${idempotencyKey})`);
        await new Promise(r => setTimeout(r, retryDelay));
      }
    }

    // Phân loại lỗi sau khi cạn số lần Retry
    const isSocketDrop = 
      lastError.name === 'TimeoutError' ||
      lastError.name === 'AbortError' ||
      lastError.cause?.code === 'ECONNRESET' ||
      lastError.cause?.code === 'UND_ERR_SOCKET';

    if (isSocketDrop) {
      console.error(`[Fee Service] Dut ket noi / Timeout sau cac lan thu lai -> Trang thai PENDING (504)`);
      const timeoutErr = new Error('Khong nhan duoc phan hoi sau cac lan thu lai (Khong biet da tru tien hay chua)');
      timeoutErr.status = HTTP_STATUS.GATEWAY_TIMEOUT;
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }

    if (lastError.cause?.code === 'ECONNREFUSED') {
      const connErr = new Error('Khong the ket noi toi may chu ngan hang (Chac chan chua tru tien)');
      connErr.status = HTTP_STATUS.SERVICE_UNAVAILABLE;
      throw connErr;
    }

    throw lastError;
  }
}

export const bankClient = new BankClient();
