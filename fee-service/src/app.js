import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { feeRoutes } from './routes/fee.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

// Middleware hỗ trợ CORS (giúp Swagger UI trên trình duyệt gọi API kèm custom headers không bị chặn)
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

// Endpoint kiểm tra sức khỏe dịch vụ
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'fee-service' });
});

// Đăng ký các routes nghiệp vụ
app.use('/', feeRoutes);

// Middleware xử lý 404 Not Found
app.use((req, res, next) => {
  const error = new Error(`Tài nguyên không tìm thấy: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Middleware xử lý lỗi tập trung (phải đặt ở cuối cùng)
app.use(errorHandler);

export default app;
