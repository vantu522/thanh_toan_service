/**
 * Kịch bản kiểm thử Tình huống 4 - Đứt giữa chừng, lỗi tạm thời, bị từ chối
 * Chạy bằng lệnh: node test-situation4.js
 */

async function runSituation4() {
  console.log('================================================================');
  console.log('TIẾN HÀNH THỰC NGHIỆM TÌNH HUỐNG 4 - LAB 3');
  console.log('================================================================\n');

  // ============================================================================
  // TEST (c): Thanh toán 25.000.000đ (Vượt hạn mức)
  // Kết quả cần đạt: Trả 402, và ngân hàng chỉ nhận đúng 1 yêu cầu (không thử lại)
  // ============================================================================
  console.log('▶️ [KIỂM TRA C] THANH TOÁN VƯỢT HẠN MỨC 25.000.000đ');
  const statsCBefore = await fetch('http://localhost:4002/stats').then(r => r.json());
  
  const resC = await fetch('http://localhost:4001/students/1/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 25000000 })
  });
  const bodyC = await resC.json();
  const statsCAfter = await fetch('http://localhost:4002/stats').then(r => r.json());
  const bankRequestsCount = statsCAfter.requests - statsCBefore.requests;

  console.log(`  📊 HTTP Status nhận được: ${resC.status} (Yêu cầu: 402)`);
  console.log(`  📦 Nội dung phản hồi:`, bodyC);
  console.log(`  🔌 Số request ngân hàng nhận được: ${bankRequestsCount} (Yêu cầu: Đúng 1 request, không retry)`);
  
  const testCPassed = resC.status === 402 && bankRequestsCount === 1;
  console.log(`  👉 Đánh giá mục (c): ${testCPassed ? 'ĐẠT XUẤT SẮC ✅' : 'CHƯA ĐẠT ❌'}`);

  // ============================================================================
  // TEST (a) hoặc (b): Gửi 60 thanh toán lần lượt với tỷ lệ lỗi
  // ============================================================================
  console.log('\n▶️ [KIỂM TRA A & B] GỬI 60 THANH TOÁN LẦN LƯỢT');
  console.log('   (Mỗi lần 1.000đ, đo số lệnh PAID, so sánh với charges & duplicates)');

  // Lấy thông tin công nợ và stats trước khi chạy
  const studentBefore = await fetch('http://localhost:4001/students/1/fees').then(r => r.json());
  const statsStart = await fetch('http://localhost:4002/stats').then(r => r.json());

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
  console.log('KẾT QUẢ THỰC NGHIỆM 60 LỆNH THANH TOÁN:');
  console.log('================================================================');
  console.log(`  🎯 Số lệnh thành công (PAID): ${paidCount}/60 (Yêu cầu: >= 54/60)`);
  console.log(`  ⏱️ Số lệnh không thành công trả 504 PENDING: ${pendingCount}`);
  console.log(`  🔌 duplicates tại Mock Bank: ${statsEnd.duplicates} (Yêu cầu: duplicates = 0)`);
  console.log(`  💰 Tiền công nợ giảm thực tế: ${actualDebtReduced.toLocaleString('vi-VN')}đ`);
  console.log(`  💰 Tiền của các lệnh PAID: ${expectedDebtReduced.toLocaleString('vi-VN')}đ`);
  console.log(`  ⏳ Thời gian phản hồi lâu nhất của 1 lệnh: ${maxTimePerReq}ms (Yêu cầu: <= 4500ms)`);

  const criteriaPaid = paidCount >= 54;
  const criteriaDuplicates = statsEnd.duplicates === 0;
  const criteriaDebtMatch = actualDebtReduced === expectedDebtReduced;
  const criteriaTime = maxTimePerReq <= 4500;

  console.log('\nĐÁNH GIÁ CÁC TIÊU CHÍ KẾT QUẢ CẦN ĐẠT:');
  console.log(`  1. >= 54/60 thanh toán thành công: ${criteriaPaid ? 'ĐẠT ✅' : 'CHƯA ĐẠT ❌'} (${paidCount}/60)`);
  console.log(`  2. duplicates = 0: ${criteriaDuplicates ? 'ĐẠT ✅' : 'CHƯA ĐẠT ❌'}`);
  console.log(`  3. Công nợ chỉ giảm đúng tiền các lệnh PAID (không trừ 2 lần): ${criteriaDebtMatch ? 'ĐẠT ✅' : 'CHƯA ĐẠT ❌'}`);
  console.log(`  4. Thời gian phản hồi luôn <= 4,5 giây: ${criteriaTime ? 'ĐẠT ✅' : 'CHƯA ĐẠT ❌'}`);
  console.log('================================================================\n');
}

runSituation4().catch(console.error);
