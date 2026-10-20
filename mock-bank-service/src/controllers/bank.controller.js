import { bankService } from '../services/bank.service.js';
import { BANK_HTTP_STATUS } from '../constants/bank.constants.js';

/**
 * Bank Controller - Tiếp nhận HTTP Request của cổng ngân hàng theo chuẩn Lab 3
 */
class BankController {
  /**
   * POST /charges
   * Quy ước: 201 kèm chargeId khi thành công
   */
  async charge(req, res, next) {
    try {
      const idempotencyKey = req.headers['idempotency-key'];
      const { reference, amount } = req.body;

      const result = await bankService.processCharge(
        { idempotencyKey, reference, amount },
        { req, res }
      );

      // Nếu là duplicate request (cùng idempotency key), trả về 200, nếu tạo mới trả về 201 kèm chargeId
      const statusCode = result.isDuplicate ? BANK_HTTP_STATUS.OK : BANK_HTTP_STATUS.CREATED;
      return res.status(statusCode).json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /stats
   * Quy ước: trả về { connections, requests, charges, duplicates }
   */
  async getStats(req, res, next) {
    try {
      const stats = await bankService.getStats();
      return res.status(BANK_HTTP_STATUS.OK).json(stats);
    } catch (error) {
      return next(error);
    }
  }
}

export const bankController = new BankController();
