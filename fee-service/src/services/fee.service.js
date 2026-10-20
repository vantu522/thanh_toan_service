import { feeRepository } from '../repositories/fee.repository.js';
import { bankClient } from '../clients/bank.client.js';
import { PAYMENT_STATUS, HTTP_STATUS } from '../constants/payment.constants.js';

/**
 * Fee Service - Xử lý nghiệp vụ thanh toán học phí theo chuẩn Lab 3
 */
class FeeService {
  /**
   * Tra cứu công nợ sinh viên
   */
  async getStudentFees(studentId) {
    console.log(`[Fee Service] Tra cuu cong no sinh vien ID: "${studentId}"`);
    const student = await feeRepository.findStudentById(studentId);
    if (!student) {
      console.warn(`[Fee Service] Khong tim thay sinh vien ID: "${studentId}"`);
      const error = new Error(`Không tìm thấy sinh viên có mã: ${studentId}`);
      error.status = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    return {
      studentId: student.id,
      name: student.name,
      debt: student.debt
    };
  }

  /**
   * Xử lý lệnh thanh toán học phí
   */
  async processPayment({ studentId, amount, idempotencyKey }) {
    console.log(`\n======================================================`);
    console.log(`[Fee Service] BAT DAU XU LY THANH TOAN`);
    console.log(`  |- Sinh vien ID: ${studentId}`);
    console.log(`  |- So tien yeu cau: ${amount?.toLocaleString('vi-VN')}d`);
    console.log(`  |- Idempotency-Key: ${idempotencyKey || '(tu dong tao theo ma lenh)'}`);

    // BƯỚC 0: KIỂM TRA IDEMPOTENCY KEY TẠI FEE SERVICE
    if (idempotencyKey) {
      const cachedResult = await feeRepository.findIdempotency(idempotencyKey);
      if (cachedResult) {
        console.log(`[Fee Service] PHAT HIEN IDEMPOTENCY KEY TRUNG LAP: "${idempotencyKey}"`);
        console.log(`  |- Tra lai ket qua giao dich cu: Lenh ${cachedResult.paymentId} (Trang thai: ${cachedResult.status})`);
        console.log(`  |- KHONG TRU NO LAN 2.`);
        console.log(`======================================================\n`);
        return {
          ...cachedResult,
          isDuplicate: true
        };
      }
    }

    // 1. Kiểm tra sự tồn tại của sinh viên
    const student = await feeRepository.findStudentById(studentId);
    if (!student) {
      console.warn(`[Fee Service] Loi: Sinh vien khong ton tai (${studentId})`);
      const error = new Error(`Không tìm thấy sinh viên có mã: ${studentId}`);
      error.status = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // 2. Kiểm tra số tiền hợp lệ
    if (!amount || typeof amount !== 'number' || amount <= 0 || Number.isNaN(amount)) {
      console.warn(`[Fee Service] Loi: So tien khong hop le (${amount})`);
      const error = new Error('Số tiền thanh toán không hợp lệ (amount phải là số dương lớn hơn 0)');
      error.status = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // 3. Kiểm tra số tiền không vượt công nợ hiện tại
    if (amount > student.debt) {
      console.warn(`[Fee Service] Loi: So tien ${amount.toLocaleString('vi-VN')}d vuot cong no ${student.debt.toLocaleString('vi-VN')}d`);
      const error = new Error(`Số tiền thanh toán (${amount.toLocaleString('vi-VN')}đ) vượt quá công nợ hiện tại (${student.debt.toLocaleString('vi-VN')}đ)`);
      error.status = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    // 4. Sinh mã lệnh thanh toán tuần tự: P1, P2...
    const paymentId = feeRepository.generatePaymentId();
    const activeIdempotencyKey = idempotencyKey || `fee-key-${paymentId}`;

    console.log(`[Fee Service] Da tao lenh thanh toan: ${paymentId}`);
    console.log(`  |- Trang thai ban dau: ${PAYMENT_STATUS.PENDING}`);
    console.log(`  |- Khoa bao ve giao dich: ${activeIdempotencyKey}`);

    const paymentRecord = {
      paymentId,
      studentId,
      amount,
      idempotencyKey: activeIdempotencyKey,
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString()
    };
    await feeRepository.savePayment(paymentRecord);

    // 5. Gọi sang cổng Mock Bank Service
    try {
      const bankResult = await bankClient.charge({
        idempotencyKey: activeIdempotencyKey,
        reference: paymentId,
        amount
      });

      // Lệnh thanh toán chính thức thành công (PAID)
      const oldDebt = student.debt;
      const newDebt = student.debt - amount;
      await feeRepository.updateStudentDebt(studentId, newDebt);

      paymentRecord.status = PAYMENT_STATUS.PAID;
      paymentRecord.chargeId = bankResult.chargeId;
      paymentRecord.completedAt = new Date().toISOString();
      await feeRepository.savePayment(paymentRecord);

      const successResponse = {
        paymentId,
        studentId,
        amount,
        status: PAYMENT_STATUS.PAID,
        chargeId: bankResult.chargeId,
        remainingDebt: newDebt
      };

      if (idempotencyKey) {
        await feeRepository.saveIdempotency(idempotencyKey, successResponse);
      }

      console.log(`[Fee Service] THANH TOAN THANH CONG.`);
      console.log(`  |- Lenh: ${paymentId} | Trang thai: ${PAYMENT_STATUS.PAID}`);
      console.log(`  |- Giao dich ngan hang: ${bankResult.chargeId}`);
      console.log(`  |- CONG NO DA TRU: ${oldDebt.toLocaleString('vi-VN')}d -> ${newDebt.toLocaleString('vi-VN')}d`);
      console.log(`======================================================\n`);

      return successResponse;

    } catch (bankErr) {
      let responseStatus = bankErr.status || 500;
      let paymentStatus = PAYMENT_STATUS.FAILED;

      if (responseStatus === HTTP_STATUS.GATEWAY_TIMEOUT || bankErr.isTimeout) {
        responseStatus = HTTP_STATUS.GATEWAY_TIMEOUT;
        paymentStatus = PAYMENT_STATUS.PENDING;
      } else if (responseStatus === HTTP_STATUS.SERVICE_UNAVAILABLE) {
        responseStatus = HTTP_STATUS.SERVICE_UNAVAILABLE;
        paymentStatus = PAYMENT_STATUS.FAILED;
      } else if (responseStatus === HTTP_STATUS.PAYMENT_REQUIRED) {
        responseStatus = HTTP_STATUS.PAYMENT_REQUIRED;
        paymentStatus = PAYMENT_STATUS.FAILED;
      } else {
        responseStatus = bankErr.status || HTTP_STATUS.SERVICE_UNAVAILABLE;
        paymentStatus = PAYMENT_STATUS.FAILED;
      }

      paymentRecord.status = paymentStatus;
      paymentRecord.error = bankErr.message;
      await feeRepository.savePayment(paymentRecord);

      console.error(`[Fee Service] GIAO DICH KHONG THANH CONG.`);
      console.error(`  |- Lenh: ${paymentId} | Trang thai: ${paymentStatus}`);
      console.error(`  |- Ma phan hoi: HTTP ${responseStatus}`);
      console.error(`  |- Chi tiet loi: ${bankErr.message}`);
      console.error(`  |- BAO TOAN CONG NO: Giu nguyen ${student.debt.toLocaleString('vi-VN')}d`);
      console.log(`======================================================\n`);

      const error = new Error(bankErr.message);
      error.status = responseStatus;
      error.paymentId = paymentId;
      error.paymentStatus = paymentStatus;
      throw error;
    }
  }
}

export const feeService = new FeeService();
