import { bankRepository } from '../repositories/bank.repository.js';
import { env } from '../config/env.js';
import { MAX_CHARGE_LIMIT, BANK_HTTP_STATUS } from '../constants/bank.constants.js';

/**
 * Bank Service - Triển khai quy tắc ngân hàng giả lập theo Lab 3
 */
class BankService {
  /**
   * Xử lý trừ tiền POST /charges
   */
  async processCharge({ idempotencyKey, reference, amount }, context = {}) {
    console.log(`\n------------------------------------------------------`);
    console.log(`[Mock Bank Service] NHAN YEU CAU TRU TIEN (POST /charges)`);
    console.log(`  |- Reference: "${reference}"`);
    console.log(`  |- So tien: ${amount?.toLocaleString('vi-VN')}d`);
    console.log(`  |- Idempotency-Key: "${idempotencyKey}"`);

    // 1. Kiểm tra header Idempotency-Key
    if (!idempotencyKey) {
      console.warn(`[Mock Bank Service] Loi 400: Thieu header Idempotency-Key`);
      const error = new Error('Thiếu header Idempotency-Key bắt buộc');
      error.status = BANK_HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // 2. Kiểm tra dữ liệu đầu vào
    if (!reference) {
      console.warn(`[Mock Bank Service] Loi 400: Thieu reference`);
      const error = new Error('Thiếu thông tin reference (mã tham chiếu)');
      error.status = BANK_HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    if (typeof amount !== 'number' || amount <= 0 || Number.isNaN(amount)) {
      console.warn(`[Mock Bank Service] Loi 400: So tien khong hop le (${amount})`);
      const error = new Error('Số tiền không hợp lệ (amount phải là số dương lớn hơn 0)');
      error.status = BANK_HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // 3. Kiểm tra hạn mức 20.000.000đ
    if (amount > MAX_CHARGE_LIMIT) {
      console.warn(`[Mock Bank Service] Loi 402: Vuot han muc 20.000.000d (${amount.toLocaleString('vi-VN')}d)`);
      const error = new Error(`Giao dịch vượt hạn mức 20.000.000đ (Yêu cầu: ${amount.toLocaleString('vi-VN')}đ)`);
      error.status = BANK_HTTP_STATUS.PAYMENT_REQUIRED;
      throw error;
    }

    // 4. Kiểm tra Idempotency-Key
    const existingCharge = await bankRepository.findChargeByIdempotencyKey(idempotencyKey);
    if (existingCharge) {
      console.log(`[Mock Bank Service] PHAT HIEN YEU CAU TRUNG LAP (Duplicate Idempotency-Key)`);
      console.log(`  |- Tra lai ket qua cu: ${existingCharge.chargeId}`);
      console.log(`  |- KHONG TRU TIEN THEM`);
      console.log(`------------------------------------------------------\n`);
      return {
        isDuplicate: true,
        chargeId: existingCharge.chargeId,
        reference: existingCharge.reference,
        amount: existingCharge.amount,
        status: existingCharge.status,
        createdAt: existingCharge.createdAt
      };
    }

    // Mô phỏng DELAY_MS
    if (env.DELAY_MS > 0) {
      console.log(`[Mock Bank Simulation] Dang tre mang ${env.DELAY_MS}ms theo cau hinh DELAY_MS...`);
      await new Promise(resolve => setTimeout(resolve, env.DELAY_MS));
    }

    // Mô phỏng FAIL_RATE
    if (env.FAIL_RATE > 0 && Math.random() < env.FAIL_RATE) {
      console.error(`[Mock Bank Simulation] FAIL_RATE kich hoat (${env.FAIL_RATE}). Tra ve HTTP 500 truoc khi tru tien.`);
      const error = new Error('Ngân hàng gặp sự cố hệ thống nội bộ (Mô phỏng FAIL_RATE 500)');
      error.status = BANK_HTTP_STATUS.INTERNAL_ERROR;
      throw error;
    }

    // 5. Trừ tiền và lưu giao dịch mới
    const chargeId = bankRepository.generateChargeId();
    const newCharge = {
      chargeId,
      reference,
      amount,
      status: 'SUCCESS',
      createdAt: new Date().toISOString()
    };

    const isDupRef = bankRepository.checkAndRecordReference(reference, idempotencyKey);
    if (isDupRef) {
      console.error(`[Mock Bank Service] CANH BAO: Reference "${reference}" bi tru tien lan 2.`);
    }

    await bankRepository.saveCharge(idempotencyKey, newCharge);
    bankRepository.incrementCharges();

    console.log(`[Mock Bank Service] TRU TIEN THANH CONG.`);
    console.log(`  |- Giao dich moi: ${chargeId}`);
    console.log(`  |- Reference: ${reference}`);
    console.log(`  |- So tien da tru: ${amount.toLocaleString('vi-VN')}d`);

    // Mô phỏng DROP_RATE
    if (env.DROP_RATE > 0 && Math.random() < env.DROP_RATE) {
      console.error(`[Mock Bank Simulation] DROP_RATE kich hoat (${env.DROP_RATE}). Tien da tru, huy socket.`);
      if (context.req?.socket) {
        context.req.socket.destroy();
        return;
      }
    }

    console.log(`------------------------------------------------------\n`);

    return {
      isDuplicate: false,
      chargeId,
      reference,
      amount,
      status: 'SUCCESS'
    };
  }

  /**
   * Lấy số liệu thống kê { connections, requests, charges, duplicates }
   */
  async getStats() {
    return bankRepository.getStats();
  }
}

export const bankService = new BankService();
