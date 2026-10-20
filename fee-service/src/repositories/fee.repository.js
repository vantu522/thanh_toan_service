import { studentsStore, paymentsStore, idempotencyStore, getNextPaymentId } from '../store/memory.store.js';

/**
 * Fee Repository - Thao tác dữ liệu In-memory Map cho Fee Service
 */
class FeeRepository {
  /**
   * Sinh mã thanh toán tuần tự P1, P2, P3...
   * @returns {string}
   */
  generatePaymentId() {
    return getNextPaymentId();
  }

  /**
   * Lấy thông tin sinh viên theo mã
   * @param {string} studentId
   * @returns {Promise<object|null>}
   */
  async findStudentById(studentId) {
    const student = studentsStore.get(String(studentId));
    return student ? { ...student } : null;
  }

  /**
   * Cập nhật công nợ (chỉ giảm công nợ khi ngân hàng đã trừ tiền thành công)
   * @param {string} studentId
   * @param {number} newDebt
   * @returns {Promise<object>}
   */
  async updateStudentDebt(studentId, newDebt) {
    const student = studentsStore.get(String(studentId));
    if (!student) {
      throw new Error(`Không tìm thấy sinh viên mã ${studentId}`);
    }
    student.debt = newDebt;
    studentsStore.set(String(studentId), student);
    return { ...student };
  }

  /**
   * Lưu hoặc cập nhật bản ghi thanh toán
   * @param {object} payment
   * @returns {Promise<object>}
   */
  async savePayment(payment) {
    paymentsStore.set(payment.paymentId, { ...payment });
    return { ...payment };
  }

  /**
   * Tìm lệnh thanh toán theo paymentId (P1, P2...)
   * @param {string} paymentId
   * @returns {Promise<object|null>}
   */
  async findPaymentById(paymentId) {
    const payment = paymentsStore.get(paymentId);
    return payment ? { ...payment } : null;
  }

  /**
   * Tra cứu kết quả đã lưu theo Idempotency Key
   * @param {string} key
   * @returns {Promise<object|null>}
   */
  async findIdempotency(key) {
    return idempotencyStore.get(key) || null;
  }

  /**
   * Lưu kết quả theo Idempotency Key
   * @param {string} key
   * @param {object} value
   */
  async saveIdempotency(key, value) {
    idempotencyStore.set(key, value);
  }
}

export const feeRepository = new FeeRepository();
