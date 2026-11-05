const fs = require('fs');
const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Thêm link rel alternate cho llms.txt & llms-full.txt (Chuẩn AI Search / AEO)
const llmsMeta = `  <!-- AI Engine & LLM Search Discovery (AEO / GEO Standard) -->
  <link rel="alternate" type="text/plain" href="https://www.vusitien.click/llms.txt" title="Sophia Codex AI Summary">
  <link rel="alternate" type="text/plain" href="https://www.vusitien.click/llms-full.txt" title="Sophia Codex Full AI Knowledge Base">`;

if (!html.includes('href="https://www.vusitien.click/llms.txt"')) {
  html = html.replace('  <!-- Multi-Engine Site Verification Meta Tags', `${llmsMeta}\n\n  <!-- Multi-Engine Site Verification Meta Tags`);
  console.log('✅ 1. Đã khai báo liên kết llms.txt & llms-full.txt vào <head>');
}

// 2. Chuyển đổi các placeholder verification thành dạng ghi chú rõ ràng để không bị crawler đánh giá là chuỗi rác
const oldVerificationRegex = /  <!-- Multi-Engine Site Verification Meta Tags \(Google Search Console, Bing, Yandex, Baidu, Naver\) -->[\s\S]*?<meta name="naver-site-verification" content="NAVER_SEARCH_ADVISOR_CODE">/;

const cleanedVerification = `  <!-- Multi-Engine Site Verification (Điền mã xác thực thực tế khi kích hoạt từng công cụ) -->
  <!-- <meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_CODE"> -->
  <!-- <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE"> -->`;

if (oldVerificationRegex.test(html)) {
  html = html.replace(oldVerificationRegex, cleanedVerification);
  console.log('✅ 2. Đã dọn dẹp các mã verification placeholder giả định');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('🎉 Hoàn thành Phiên 4 thành công!');
