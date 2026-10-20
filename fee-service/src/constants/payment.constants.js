/**
 * Quy ước trạng thái và mã HTTP theo chuẩn Lab 3 - Hệ Thống Thanh Toán Phân Tán
 */

export const PAYMENT_STATUS = {
  PAID: 'PAID',       // Thành công: Ngân hàng đã xác nhận trừ tiền
  FAILED: 'FAILED',   // Thất bại: Ngân hàng từ chối rõ ràng hoặc chắc chắn chưa trừ tiền
  PENDING: 'PENDING'  // Đang chờ / Nghi vấn: Không biết đã trừ tiền hay chưa (Timeout, đứt kết nối)
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  PAYMENT_REQUIRED: 402, // Ngân hàng từ chối do vượt hạn mức (giữ mã 402 của ngân hàng)
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503, // Chắc chắn chưa trừ tiền (không kết nối được ngân hàng)
  GATEWAY_TIMEOUT: 504      // Không biết đã trừ tiền hay chưa (hết thời gian chờ / đứt socket khi chờ)
};
