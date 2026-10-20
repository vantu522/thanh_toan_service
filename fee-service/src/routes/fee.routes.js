import { Router } from 'express';
import { feeController } from '../controllers/fee.controller.js';

const router = Router();

/**
 * Định tuyến cho tài nguyên sinh viên và học phí:
 * - GET  /students/:id/fees     : Tra cứu công nợ sinh viên
 * - POST /students/:id/payments : Thanh toán học phí
 */
router.get('/students/:id/fees', feeController.getFees);
router.post('/students/:id/payments', feeController.payFee);

export const feeRoutes = router;
