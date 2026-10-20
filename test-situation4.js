/**
 * Kịch bản kiểm thử Tình huống 4 - Đứt giữa chừng, lỗi tạm thời, bị từ chối
 * Chạy bằng lệnh: node test-situation4.js
 */

async function runSituation4() {
  console.log('================================================================');
  console.log('TIEN HANH THUC NGHIEM TINH HUONG 4 - LAB 3');
  console.log('================================================================\n');

  // TEST (c): Thanh toán 25.000.000đ
  console.log('[KIEM TRA C] THANH TOAN VUOT HAN MUC 25.000.000d');
  const statsCBefore = await fetch('http://localhost:4002/stats').then(r => r.json());
  
  const resC = await fetch('http://localhost:4001/students/1/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 25000000 })
  });
  const bodyC = await resC.json();
  const statsCAfter = await fetch('http://localhost:4002/stats').then(r => r.json());
  const bankRequestsCount = statsCAfter.requests - statsCBefore.requests;

  console.log(`  HTTP Status nhan duoc: ${resC.status} (Yeu cau: 402)`);
  console.log(`  Noi dung phan hoi:`, bodyC);
  console.log(`  So request ngan hang nhan duoc: ${bankRequestsCount} (Yeu cau: Dung 1 request, khong retry)`);
  
  const testCPassed = resC.status === 402 && bankRequestsCount === 1;
  console.log(`  Danh gia muc (c): ${testCPassed ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);

  // TEST (a) & (b): Gửi 60 thanh toán lần lượt
  console.log('\n[KIEM TRA A & B] GUI 60 THANH TOAN LAN LUOT');
  console.log('   (Moi lan 1.000d, do so lenh PAID, so sanh voi charges & duplicates)');

  const studentBefore = await fetch('http://localhost:4001/students/1/fees').then(r => r.json());

  let paidCount = 0;
  let pendingCount = 0;
  let otherCount = 0;
  let maxTimePerReq = 0;

  for (let i = 1; i <= 60; i++) {
    const t0 = Date.now();
    const res = await fetch('http://localhost:4001/students/1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 })
    });
    const reqDuration = Date.now() - t0;
    if (reqDuration > maxTimePerReq) maxTimePerReq = reqDuration;

    const data = await res.json().catch(() => ({}));
    if (res.status === 201 && data.status === 'PAID') {
      paidCount++;
    } else if (res.status === 504 && data.status === 'PENDING') {
      pendingCount++;
    } else {
      otherCount++;
    }
  }

  const studentAfter = await fetch('http://localhost:4001/students/1/fees').then(r => r.json());
  const statsEnd = await fetch('http://localhost:4002/stats').then(r => r.json());

  const actualDebtReduced = studentBefore.debt - studentAfter.debt;
  const expectedDebtReduced = paidCount * 1000;

  console.log('\n================================================================');
  console.log('KET QUA THUC NGHIEM 60 LENH THANH TOAN:');
  console.log('================================================================');
  console.log(`  So lenh thanh cong (PAID): ${paidCount}/60 (Yeu cau: >= 54/60)`);
  console.log(`  So lenh tra ve 504 PENDING: ${pendingCount}`);
  console.log(`  duplicates tai Mock Bank: ${statsEnd.duplicates} (Yeu cau: duplicates = 0)`);
  console.log(`  Tien cong no giam thuc te: ${actualDebtReduced.toLocaleString('vi-VN')}d`);
  console.log(`  Tien cua cac lenh PAID: ${expectedDebtReduced.toLocaleString('vi-VN')}d`);
  console.log(`  Thoi gian phan hoi lau nhat cua 1 lenh: ${maxTimePerReq}ms (Yeu cau: <= 4500ms)`);

  const criteriaPaid = paidCount >= 54;
  const criteriaDuplicates = statsEnd.duplicates === 0;
  const criteriaDebtMatch = actualDebtReduced === expectedDebtReduced;
  const criteriaTime = maxTimePerReq <= 4500;

  console.log('\nDANH GIA CAC TIEU CHI:');
  console.log(`  1. >= 54/60 thanh toan thanh cong: ${criteriaPaid ? 'DAT [OK]' : 'CHUA DAT [FAILED]'} (${paidCount}/60)`);
  console.log(`  2. duplicates = 0: ${criteriaDuplicates ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);
  console.log(`  3. Cong no chi giam dung tien cac lenh PAID: ${criteriaDebtMatch ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);
  console.log(`  4. Thoi gian phan hoi luon <= 4,5 giay: ${criteriaTime ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);
  console.log('================================================================\n');
}

runSituation4().catch(console.error);
