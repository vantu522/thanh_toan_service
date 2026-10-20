/**
 * Middleware xử lý lỗi tập trung cho Fee Service.
 * 
 * Tuân thủ quy ước đề bài Lab 3:
 * "Thân phản hồi lỗi là JSON có error, paymentId và status."
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.status || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ tại Fee Service';

  // Định dạng phản hồi lỗi theo đúng quy ước Lab 3
  const responseBody = {
    error: message
  };

  // Nếu là lỗi trong quá trình xử lý lệnh thanh toán, bắt buộc kèm paymentId và status (FAILED hoặc PENDING)
  if (err.paymentId) {
    responseBody.paymentId = err.paymentId;
  }
  if (err.paymentStatus) {
    responseBody.status = err.paymentStatus;
  }

  // Log theo dõi các lỗi 5xx
  if (statusCode >= 500) {
    console.error(`[Fee Service Error ${statusCode}]:`, err.message);
  }

  return res.status(statusCode).json(responseBody);
}
