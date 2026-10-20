import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { bankRoutes } from './routes/bank.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { bankRepository } from './repositories/bank.repository.js';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

// Middleware hỗ trợ CORS (đặc biệt cho header Idempotency-Key từ Swagger UI trên trình duyệt)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Idempotency-Key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware phân tích cú pháp JSON body
app.use(express.json());

// Giao diện Swagger UI tài liệu API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware đếm số lượng HTTP Request vào hệ thống ngân hàng (bỏ qua /api-docs, /health, /stats để chỉ đếm request nghiệp vụ)
app.use((req, res, next) => {
  const isSystemPath = req.path.startsWith('/api-docs') || req.path === '/stats' || req.path === '/health';
  if (!isSystemPath && req.method !== 'OPTIONS') {
    bankRepository.incrementRequests();
  }
  next();
});

// Endpoint kiểm tra sức khỏe dịch vụ
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'mock-bank-service' });
});

// Đăng ký routes ngân hàng
app.use('/', bankRoutes);

// Xử lý route không tồn tại (404)
app.use((req, res, next) => {
  const error = new Error(`Tài nguyên không tồn tại: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Xử lý lỗi tập trung
app.use(errorHandler);

export default app;
