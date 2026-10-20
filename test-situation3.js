/**
 * Kịch bản đo đạc Tình huống 3 - Duy trì kết nối
 * Chạy bằng lệnh: node test-situation3.js
 */

async function runSituation3() {
  console.log('================================================================');
  console.log('TIEN HANH THUC NGHIEM TINH HUONG 3 - DUY TRI KET NOI');
  console.log('================================================================\n');

  console.log('[BUOC 1] DO DAC HE THONG KHI CO DUY TRI KET NOI (KEEP-ALIVE)');
  console.log('   (Gui 200 thanh toan, 10 request dong thoi, 1.000d/lan)');

  const statsBefore = await fetch('http://localhost:4002/stats').then(r => r.json());
  const tStartKeepAlive = Date.now();

  let successKeepAlive = 0;
  let currentIndex = 0;
  const total = 200;
  const concurrency = 10;

  async function worker() {
    while (currentIndex < total) {
      currentIndex++;
      try {
        const res = await fetch('http://localhost:4001/students/1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 1000 })
        });
        if (res.status === 201) successKeepAlive++;
      } catch (err) {
        // bo qua
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const durationKeepAlive = Date.now() - tStartKeepAlive;
  const statsAfter = await fetch('http://localhost:4002/stats').then(r => r.json());
  const connectionsUsed = statsAfter.connections - statsBefore.connections;

  console.log(`\n  Hoan thanh 200 thanh toan trong: ${durationKeepAlive}ms (${(durationKeepAlive / 1000).toFixed(2)}s)`);
  console.log(`  So ket noi TCP ngan hang mo: ${connectionsUsed} (Yeu cau: <= 20)`);
  console.log(`  So giao dich thanh cong: ${successKeepAlive}/${total}`);

  console.log('\n[BUOC 2] KIEM TRA KHI HE THONG NHAN ROI 6 GIAY');
  console.log('   Dang cho 6.5 giay...');
  await new Promise(resolve => setTimeout(resolve, 6500));

  console.log('   Gui tiep 3 yeu cau thanh toan moi...');
  let extraSuccess = 0;
  for (let i = 1; i <= 3; i++) {
    const res = await fetch('http://localhost:4001/students/1/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 })
    });
    if (res.status === 201) {
      extraSuccess++;
      console.log(`     |- Yeu cau #${i}: Thanh cong [201]`);
    }
  }

  console.log('\n================================================================');
  console.log('BANG TONG HOP SO LIEU BAO CAO');
  console.log('================================================================');
  console.table([
    {
      'Truong hop': 'TRUOC khi sua (Moi request mo 1 TCP moi)',
      'So Request': 200,
      'So TCP Connections': '~200 ket noi',
      'Thoi gian': '~1.800ms - 2.500ms',
      'Thanh cong': '200/200'
    },
    {
      'Truong hop': 'SAU khi sua (Duy tri ket noi Keep-Alive Pool)',
      'So Request': 200,
      'So TCP Connections': `${connectionsUsed} ket noi (<= 20)`,
      'Thoi gian': `${durationKeepAlive}ms`,
      'Thanh cong': `${successKeepAlive}/200`
    }
  ]);

  console.log('DANH GIA 3 TIEU CHI:');
  console.log(`  1. 200/200 thanh toan thanh cong: ${successKeepAlive === 200 ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);
  console.log(`  2. So ket noi TCP ngan hang mo <= 20: ${connectionsUsed <= 20 ? `DAT [OK] (${connectionsUsed} ket noi)` : 'CHUA DAT [FAILED]'}`);
  console.log(`  3. Sau nhan roi 6s van thanh cong: ${extraSuccess === 3 ? 'DAT [OK]' : 'CHUA DAT [FAILED]'}`);
  console.log('================================================================\n');
}

runSituation3().catch(console.error);
