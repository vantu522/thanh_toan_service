/**
 * Kịch bản kiểm thử Tình huống 2 - Ngân hàng phản hồi rất chậm
 * Chạy bằng lệnh: node test-situation2.js
 */

async function runTest() {
  console.log('========================================================');
  console.log('BAT DAU DO DAC TINH HUONG 2 (DELAY_MS = 5000)');
  console.log('========================================================\n');

  console.log('1. Dang ban dong thoi 20 request thanh toan vao Fee Service...');
  const payments = Array.from({ length: 20 }, (_, index) =>
    fetch('http://localhost:4001/students/1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 10000 })
    }).then(async (res) => ({
      index: index + 1,
      status: res.status,
      body: await res.json()
    }))
  );

  await new Promise((resolve) => setTimeout(resolve, 200));

  console.log('2. Khi 20 thanh toan DANG CHO, thuc hien goi ngay GET /students/1/fees...');
  const startFeeTime = Date.now();
  const resFee = await fetch('http://localhost:4001/students/1/fees');
  const feeDuration = Date.now() - startFeeTime;
  const feeData = await resFee.json();

  console.log('\n--- KET QUA DO DAC API XEM CONG NO ---');
  console.log(`Thoi gian phan hoi: ${feeDuration}ms (Yeu cau: < 300ms)`);
  console.log(`HTTP Status: ${resFee.status} (Yeu cau: 200)`);
  console.log(`Du lieu cong no:`, feeData);
  console.log(`Tieu chi 3: ${feeDuration < 300 ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);

  console.log('\n3. Dang cho 20 request thanh toan kich hoat Timeout (khoang 4 giay)...');
  const results = await Promise.all(payments);
  const sample = results[0];

  console.log('\n--- KET QUA CUA 20 REQUEST THANH TOAN KHI BI TIMEOUT ---');
  console.log(`HTTP Status nhan duoc: ${sample.status} (Yeu cau: 504)`);
  console.log(`Body mau:`, sample.body);
  console.log(`Tieu chi 1 va 2: ${sample.status === 504 && sample.body.status === 'PENDING' ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);
  console.log('\n========================================================');
}

runTest().catch((err) => {
  console.error('Loi khi chay test:', err.message);
});
