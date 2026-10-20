/**
 * In-memory Store cho Mock Bank Service theo quy ước Lab 3
 */

// Bảng lưu giao dịch theo Idempotency-Key
export const chargesStore = new Map();

// Bảng lưu các reference đã trừ tiền để phát hiện việc trừ tiền trùng lặp cho cùng một reference
export const processedReferences = new Map();

// Bộ đếm tạo mã chargeId tuần tự: C1, C2...
let chargeSequence = 0;

export function getNextChargeId() {
  chargeSequence += 1;
  return `C${chargeSequence}`;
}

// Bộ đếm thống kê hệ thống: { connections, requests, charges, duplicates }
export const statsStore = {
  connections: 0, // Số kết nối TCP mới nhận
  requests: 0,    // Tổng số HTTP request nhận được
  charges: 0,     // Số lần trừ tiền thành công
  duplicates: 0   // Số lần trừ tiền trùng cho cùng một reference (phải luôn = 0 nếu hệ thống chuẩn)
};
