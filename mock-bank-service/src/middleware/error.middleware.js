/**
 * Middleware xử lý lỗi tập trung cho Mock Bank Service.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ tại Mock Bank Service';

  if (status >= 500) {
    console.error(`[Mock Bank Error 500]:`, err);
  }

  return res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(err.details && { details: err.details })
    }
  });
}
