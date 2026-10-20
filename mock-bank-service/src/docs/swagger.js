/**
 * Cấu hình tài liệu Swagger OpenAPI 3.0 cho Mock Bank Service theo chuẩn Lab 3
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Mock Bank Service API - Lab 3',
    version: '1.0.0',
    description: 'Cổng thanh toán ngân hàng giả lập theo chuẩn Lab 3.'
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
        summary: 'Kiểm tra trạng thái dịch vụ ngân hàng',
        tags: ['System'],
        responses: {
          200: {
            description: 'Dịch vụ đang chạy',
            content: {
              'application/json': {
                example: { status: 'ok', service: 'mock-bank-service' }
              }
            }
          }
        }
      }
    },
    '/stats': {
      get: {
        summary: 'Lấy thống kê hệ thống (GET /stats)',
        description: 'Trả về { connections, requests, charges, duplicates }. connections là số kết nối TCP mới nhận. duplicates là số lần trừ tiền trùng cho cùng một reference (phải luôn = 0).',
        tags: ['Statistics'],
        responses: {
          200: {
            description: 'Thông số thống kê',
            content: {
              'application/json': {
                example: {
                  connections: 1,
                  requests: 3,
                  charges: 2,
                  duplicates: 0
                }
              }
            }
          }
        }
      }
    },
    '/charges': {
      post: {
        summary: 'Thực hiện trừ tiền (POST /charges)',
        description: 'Nhận reference, amount và header Idempotency-Key. Trả về 201 kèm chargeId khi thành công, 400 nếu số tiền không hợp lệ, 402 nếu vượt hạn mức 20.000.000đ. Gửi lại cùng Idempotency-Key thì trả lại giao dịch cũ, không trừ thêm.',
        tags: ['Charges'],
        parameters: [
          {
            name: 'Idempotency-Key',
            in: 'header',
            required: true,
            description: 'Khóa chống trừ tiền trùng lặp (Bắt buộc)',
            schema: {
              type: 'string',
              example: 'bank-key-001'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reference', 'amount'],
                properties: {
                  reference: {
                    type: 'string',
                    description: 'Mã tham chiếu thanh toán (Ví dụ mã lệnh P1)',
                    example: 'P1'
                  },
                  amount: {
                    type: 'number',
                    description: 'Số tiền trừ (VND, tối đa 20.000.000đ)',
                    example: 100000
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Trừ tiền thành công, trả về 201 kèm chargeId',
            content: {
              'application/json': {
                example: {
                  chargeId: 'C1',
                  reference: 'P1',
                  amount: 100000,
                  status: 'SUCCESS'
                }
              }
            }
          },
          200: {
            description: 'Giao dịch cũ được trả lại do gửi trùng Idempotency-Key (Không trừ thêm)',
            content: {
              'application/json': {
                example: {
                  isDuplicate: true,
                  chargeId: 'C1',
                  reference: 'P1',
                  amount: 100000,
                  status: 'SUCCESS'
                }
              }
            }
          },
          400: {
            description: 'Số tiền không hợp lệ hoặc thiếu dữ liệu bắt buộc',
            content: {
              'application/json': {
                example: {
                  error: {
                    status: 400,
                    message: 'Số tiền không hợp lệ (amount phải là số dương lớn hơn 0)'
                  }
                }
              }
            }
          },
          402: {
            description: 'Vượt hạn mức 20.000.000đ theo quy định ngân hàng',
            content: {
              'application/json': {
                example: {
                  error: {
                    status: 402,
                    message: 'Giao dịch vượt hạn mức 20.000.000đ'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
