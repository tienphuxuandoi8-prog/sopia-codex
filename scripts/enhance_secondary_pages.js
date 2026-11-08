const fs = require('fs');

const pricingSchema = `  <!-- Structured Data: Product & Offer Schema (SOPHIA-SEO) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": "https://www.vusitien.click/pricing.html#membership",
        "name": "Gói Hội Viên Triết Học Sophia Codex Premium",
        "description": "Mở khóa toàn văn 124 chương kinh điển, Audio Studio AI và đối thoại phản tư không giới hạn cùng Socrates AI.",
        "image": "https://www.vusitien.click/assets/covers/suy-tuong.svg",
        "brand": {
          "@type": "Brand",
          "name": "Sophia Codex"
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "VND",
          "lowPrice": "49000",
          "highPrice": "399000",
          "offerCount": "2",
          "offers": [
            {
              "@type": "Offer",
              "name": "Gói Tầm Đạo (Theo Tháng)",
              "price": "49000",
              "priceCurrency": "VND",
              "availability": "https://schema.org/InStock",
              "url": "https://www.vusitien.click/pricing.html"
            },
            {
              "@type": "Offer",
              "name": "Gói Triết Gia (Theo Năm / Trọn Đời)",
              "price": "399000",
              "priceCurrency": "VND",
              "availability": "https://schema.org/InStock",
              "url": "https://www.vusitien.click/pricing.html"
            }
          ]
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Trang Chủ",
            "item": "https://www.vusitien.click/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Đặc Quyền Hội Viên",
            "item": "https://www.vusitien.click/pricing.html"
          }
        ]
      }
    ]
  }
  </script>`;

// 1. TỐI ƯU PRICING.HTML
['pricing.html', 'public/pricing.html'].forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  // Insert Meta tags if not present
  if (!html.includes('<link rel="canonical"')) {
    const metaTags = `  <meta name="description" content="Đặc quyền hội viên Sophia Codex: Đọc không giới hạn 124 chương toàn văn kinh điển, Audio Studio AI và đối thoại triết học Socrates AI.">
  <link rel="canonical" href="https://www.vusitien.click/pricing.html">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Đặc Quyền Hội Viên — Sophia Codex">
  <meta property="og:description" content="Mở khóa kho tàng triết học toàn văn và đối thoại phản biện không giới hạn cùng Socrates AI.">
  <meta property="og:url" content="https://www.vusitien.click/pricing.html">
  <meta property="og:image" content="https://www.vusitien.click/assets/covers/suy-tuong.svg">
${pricingSchema}`;

    html = html.replace('<title>Đặc Quyền Hội Viên - Sophia Codex</title>', `<title>Đặc Quyền Hội Viên — Sophia Codex</title>\n${metaTags}`);
  }

  // Insert seo-tracking.js if not present
  if (!html.includes('seo-tracking.js')) {
    html = html.replace('</body>', '  <!-- SEO, GEO & Retention Tracking Engine -->\n  <script defer src="js/seo-tracking.js"></script>\n</body>');
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('✓ Successfully enhanced pricing metadata & schema in:', file);
});

// 2. TỐI ƯU PRIVACY.HTML
['privacy.html', 'public/privacy.html'].forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('<link rel="canonical"')) {
    const metaTags = `    <meta name="description" content="Chính sách bảo mật thông tin và quyền riêng tư của độc giả tại Thư viện Triết học Sophia Codex.">
    <link rel="canonical" href="https://www.vusitien.click/privacy.html">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Chính Sách Bảo Mật — Sophia Codex">
    <meta property="og:url" content="https://www.vusitien.click/privacy.html">`;

    html = html.replace('<title>Chính Sách Bảo Mật - Sophia Codex</title>', `<title>Chính Sách Bảo Mật — Sophia Codex</title>\n${metaTags}`);
  }

  if (!html.includes('seo-tracking.js')) {
    html = html.replace('</body>', '    <!-- SEO, GEO & Retention Tracking Engine -->\n    <script defer src="js/seo-tracking.js"></script>\n</body>');
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('✓ Successfully enhanced privacy metadata in:', file);
});

// 3. TỐI ƯU TERMS.HTML
['terms.html', 'public/terms.html'].forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('<link rel="canonical"')) {
    const metaTags = `    <meta name="description" content="Điều khoản dịch vụ và quy định sử dụng thư viện triết học số toàn văn Sophia Codex.">
    <link rel="canonical" href="https://www.vusitien.click/terms.html">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Điều Khoản Dịch Vụ — Sophia Codex">
    <meta property="og:url" content="https://www.vusitien.click/terms.html">`;

    html = html.replace('<title>Điều Khoản Dịch Vụ - Sophia Codex</title>', `<title>Điều Khoản Dịch Vụ — Sophia Codex</title>\n${metaTags}`);
  }

  if (!html.includes('seo-tracking.js')) {
    html = html.replace('</body>', '    <!-- SEO, GEO & Retention Tracking Engine -->\n    <script defer src="js/seo-tracking.js"></script>\n</body>');
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('✓ Successfully enhanced terms metadata in:', file);
});
