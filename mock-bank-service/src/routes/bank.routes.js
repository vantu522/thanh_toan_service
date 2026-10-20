import { Router } from 'express';
import { bankController } from '../controllers/bank.controller.js';

const router = Router();

/**
 * Định tuyến Mock Bank:
 * - POST /charges : Thực hiện trừ tiền
 * - GET  /stats   : Thống kê connections, requests, charges, duplicates
 */
router.post('/charges', bankController.charge);
router.get('/stats', bankController.getStats);

export const bankRoutes = router;
