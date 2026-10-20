/**
 * Hằng số quy ước cho Mock Bank Service theo Lab 3
 */

export const MAX_CHARGE_LIMIT = 20_000_000; // Hạn mức tối đa 20.000.000đ

export const BANK_HTTP_STATUS = {
  OK: 200,
  CREATED: 201,             // Trừ tiền thành công
  BAD_REQUEST: 400,         // Số tiền không hợp lệ hoặc thiếu dữ liệu
  PAYMENT_REQUIRED: 402,    // Vượt hạn mức 20.000.000đ
  INTERNAL_ERROR: 500       // Lỗi mô phỏng FAIL_RATE
};
