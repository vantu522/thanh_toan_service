/**
 * Cấu hình tài liệu Swagger OpenAPI 3.0 cho Fee Service theo chuẩn Lab 3
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Fee Service API - Lab 3',
    version: '1.0.0',
    description: 'Quản lý công nợ và thanh toán học phí theo chuẩn kiến trúc phân tán.'
  },
  servers: [
    {
      url: '/',
      description: 'Máy chủ hiện tại (Current Host/Port)'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Kiểm tra trạng thái hoạt động của service',
        tags: ['System'],
        responses: {
          200: {
            description: 'Dịch vụ đang chạy',
            content: {
              'application/json': {
                example: { status: 'ok', service: 'fee-service' }
              }
            }
          }
        }
      }
    },
    '/students/{id}/fees': {
      get: {
        summary: 'Tra cứu công nợ sinh viên (GET /students/{id}/fees)',
        description: 'Dữ liệu công nợ ban đầu: Sinh viên 1 nợ 50tr; Sinh viên 2 nợ 0đ; Sinh viên 3 nợ 3.2tr. Ngân hàng gặp sự cố thì endpoint này vẫn hoạt động bình thường.',
        tags: ['Fees'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Mã sinh viên (1, 2, hoặc 3)',
            schema: {
              type: 'string',
              example: '1'
            }
          }
        ],
        responses: {
          200: {
            description: 'Thông tin công nợ sinh viên',
            content: {
              'application/json': {
                example: {
                  studentId: '1',
                  name: 'Sinh viên 1',
                  debt: 50000000
                }
              }
            }
          },
          404: {
            description: 'Không tìm thấy sinh viên',
            content: {
              'application/json': {
                example: {
                  error: 'Không tìm thấy sinh viên có mã: 99'
                }
              }
            }
          }
        }
      }
    },
    '/students/{id}/payments': {
      post: {
        summary: 'Tạo lệnh thanh toán học phí (POST /students/{id}/payments)',
        description: 'Tạo lệnh P1, P2... Kiểm tra số tiền không vượt công nợ. Trả về kết quả theo chuẩn Lab 3: Thành công (201, PAID), Ngân hàng từ chối (402, FAILED), Mất kết nối (503, FAILED), Timeout (504, PENDING).',
        tags: ['Payments'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Mã sinh viên cần thanh toán',
            schema: {
              type: 'string',
              example: '1'
            }
          },
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: false,
            description: 'Khóa chống trừ tiền trùng lặp (tùy chọn / khuyến nghị)',
            schema: {
              type: 'string',
              example: 'pay-key-student1-p1'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: {
                    type: 'number',
                    description: 'Số tiền thanh toán (VND)',
                    example: 100000
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Thành công (status: PAID) - Ngân hàng xác nhận đã trừ tiền',
            content: {
              'application/json': {
                example: {
                  paymentId: 'P1',
                  studentId: '1',
                  amount: 100000,
                  status: 'PAID'
                }
              }
            }
          },
          402: {
            description: 'Ngân hàng từ chối rõ ràng (status: FAILED) - Giữ mã của ngân hàng (ví dụ 402 vượt hạn mức)',
            content: {
              'application/json': {
                example: {
                  error: 'Giao dịch vượt hạn mức 20.000.000đ',
                  paymentId: 'P1',
                  status: 'FAILED'
                }
              }
            }
          },
          503: {
            description: 'Chắc chắn chưa trừ tiền (status: FAILED) - Không kết nối được tới ngân hàng',
            content: {
              'application/json': {
                example: {
                  error: 'Không kết nối được tới cổng ngân hàng',
                  paymentId: 'P1',
                  status: 'FAILED'
                }
              }
            }
          },
          504: {
            description: 'Không biết đã trừ tiền hay chưa (status: PENDING) - Hết thời gian chờ hoặc đứt kết nối khi đang chờ trả lời',
            content: {
              'application/json': {
                example: {
                  error: 'Hết thời gian chờ phản hồi từ ngân hàng',
                  paymentId: 'P1',
                  status: 'PENDING'
                }
              }
            }
          }
        }
      }
    }
  }
};
