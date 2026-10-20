/**
 * In-memory Store cho Fee Service
 * Dữ liệu được lưu trong bộ nhớ theo yêu cầu Lab 3.
 */

// Danh sách sinh viên và công nợ ban đầu:
// - Sinh viên 1: nợ 50.000.000đ
// - Sinh viên 2: nợ 0đ
// - Sinh viên 3: nợ 3.200.000đ
export const studentsStore = new Map([
  ['1', { id: '1', name: 'Sinh viên 1', debt: 50_000_000 }],
  ['2', { id: '2', name: 'Sinh viên 2', debt: 0 }],
  ['3', { id: '3', name: 'Sinh viên 3', debt: 3_200_000 }]
]);

// Bảng lưu danh sách các lệnh thanh toán: Key: paymentId ("P1", "P2", ...)
export const paymentsStore = new Map();

// Bộ đếm tạo mã lệnh thanh toán tuần tự: P1, P2, P3... theo đề bài
let paymentSequence = 0;

export function getNextPaymentId() {
  paymentSequence += 1;
  return `P${paymentSequence}`;
}

// Bảng lưu Idempotency Key
export const idempotencyStore = new Map();
