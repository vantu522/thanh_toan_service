import { chargesStore, statsStore, processedReferences, getNextChargeId } from '../store/memory.store.js';

/**
 * Bank Repository - Thao tác dữ liệu In-memory cho Mock Bank
 */
class BankRepository {
  /**
   * Sinh mã chargeId tuần tự C1, C2...
   * @returns {string}
   */
  generateChargeId() {
    return getNextChargeId();
  }

  /**
   * Tìm giao dịch cũ theo Idempotency-Key
   * @param {string} idempotencyKey
   * @returns {Promise<object|null>}
   */
  async findChargeByIdempotencyKey(idempotencyKey) {
    const charge = chargesStore.get(idempotencyKey);
    return charge ? { ...charge } : null;
  }

  /**
   * Lưu giao dịch theo Idempotency-Key
   * @param {string} idempotencyKey
   * @param {object} chargeData
   * @returns {Promise<object>}
   */
  async saveCharge(idempotencyKey, chargeData) {
    chargesStore.set(idempotencyKey, { ...chargeData });
    return { ...chargeData };
  }

  /**
   * Kiểm tra và ghi nhận reference đã được trừ tiền
   * @param {string} reference
   * @param {string} idempotencyKey
   * @returns {boolean} true nếu reference đã từng trừ tiền bởi 1 idempotencyKey khác (duplicate charge!)
   */
  checkAndRecordReference(reference, idempotencyKey) {
    const existingKey = processedReferences.get(reference);
    if (existingKey && existingKey !== idempotencyKey) {
      // Bị trừ tiền trùng cho cùng 1 reference!
      statsStore.duplicates += 1;
      return true;
    }
    processedReferences.set(reference, idempotencyKey);
    return false;
  }

  /**
   * Tăng số lượng TCP connection mới
   */
  incrementConnections() {
    statsStore.connections += 1;
  }

  /**
   * Tăng số lượng HTTP Request
   */
  incrementRequests() {
    statsStore.requests += 1;
  }

  /**
   * Tăng số lượng giao dịch trừ tiền thành công
   */
  incrementCharges() {
    statsStore.charges += 1;
  }

  /**
   * Tăng số lượng duplicate
   */
  incrementDuplicates() {
    statsStore.duplicates += 1;
  }

  /**
   * Lấy chỉ số thống kê chuẩn theo Lab 3
   * @returns {Promise<object>}
   */
  async getStats() {
    return {
      connections: statsStore.connections,
      requests: statsStore.requests,
      charges: statsStore.charges,
      duplicates: statsStore.duplicates
    };
  }
}

export const bankRepository = new BankRepository();
