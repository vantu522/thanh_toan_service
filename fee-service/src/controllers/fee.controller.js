import { feeService } from '../services/fee.service.js';
import { HTTP_STATUS, PAYMENT_STATUS } from '../constants/payment.constants.js';

/**
 * Fee Controller - Tiếp nhận HTTP Request và phản hồi theo chuẩn Lab 3
 */
class FeeController {
  /**
   * GET /students/:id/fees
   */
  async getFees(req, res, next) {
    try {
      const { id } = req.params;
      const data = await feeService.getStudentFees(id);
      return res.status(HTTP_STATUS.OK).json(data);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /students/:id/payments
   * Nhận {"amount": 100000}
   */
  async payFee(req, res, next) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      const idempotencyKey = req.headers['idempotency-key'];

      const result = await feeService.processPayment({
        studentId: id,
        amount,
        idempotencyKey
      });

      // Nếu thành công (PAID), trả về HTTP 201 theo quy ước
      const statusCode = result.status === PAYMENT_STATUS.PAID ? HTTP_STATUS.CREATED : HTTP_STATUS.OK;
      return res.status(statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const feeController = new FeeController();
