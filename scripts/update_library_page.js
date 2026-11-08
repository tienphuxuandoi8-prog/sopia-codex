const fs = require('fs');

const libraryFiles = ['library.html', 'public/library.html'];

const schemaScript = `    <!-- Structured Data Schema: CollectionPage & ItemList (SOPHIA-SEO) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": "https://www.vusitien.click/thu-vien#webpage",
          "url": "https://www.vusitien.click/thu-vien",
          "name": "Tủ Sách Tri Thức & Sổ Tay Chiêm Nghiệm — Sophia Codex",
          "description": "Không gian lưu trữ tiến trình đọc toàn văn kinh điển, ghi chú chiêm nghiệm và danh ngôn triết học cá nhân.",
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://www.vusitien.click/#website",
            "name": "Sophia Codex",
            "url": "https://www.vusitien.click/"
          },
          "breadcrumb": {
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
                "name": "Tủ Sách Tri Thức",
                "item": "https://www.vusitien.click/thu-vien"
              }
            ]
          }
        },
        {
          "@type": "ItemList",
          "@id": "https://www.vusitien.click/thu-vien#books-list",
          "name": "Tủ Sách Kinh Điển Triết Học Sophia Codex",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "url": "https://www.vusitien.click/kinh-dien/dao-duc-kinh",
              "name": "Đạo Đức Kinh (Tao Te Ching) — Lão Tử"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "url": "https://www.vusitien.click/kinh-dien/suy-tuong",
              "name": "Suy Tưởng (Meditations) — Marcus Aurelius"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "url": "https://www.vusitien.click/kinh-dien/cong-hoa",
              "name": "Cộng Hòa (The Republic) — Plato"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "url": "https://www.vusitien.click/kinh-dien/zarathustra",
              "name": "Zarathustra Đã Nói Như Thế — Friedrich Nietzsche"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "url": "https://www.vusitien.click/kinh-dien/ban-ve-tu-do",
              "name": "Bàn Về Tự Do (On Liberty) — John Stuart Mill"
            }
          ]
        }
      ]
    }
    </script>
`;

libraryFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  // 1. Update canonical & og:url to Clean URL /thu-vien
  html = html.replace(
    /<link rel="canonical" href="https:\/\/www\.vusitien\.click\/library\.html">/g,
    '<link rel="canonical" href="https://www.vusitien.click/thu-vien">'
  );
  html = html.replace(
    /<meta property="og:url" content="https:\/\/www\.vusitien\.click\/library\.html">/g,
    '<meta property="og:url" content="https://www.vusitien.click/thu-vien">'
  );

  // 2. Insert Schema JSON-LD before </head> if not already present
  if (!html.includes('https://www.vusitien.click/thu-vien#books-list')) {
    html = html.replace('</head>', `${schemaScript}\n</head>`);
  }

  // 3. Update book card links to Clean URLs /kinh-dien/${book.id}
  html = html.replace(/onclick="window\.location\.href='index\.html\?book=\${book\.id}'"/g, "onclick=\"window.location.href='/kinh-dien/' + book.id\"");
  html = html.replace(/href="index\.html\?book=\${book\.id}"/g, "href=\"/kinh-dien/${book.id}\"");

  // 4. Add seo-tracking.js before </body>
  if (!html.includes('js/seo-tracking.js')) {
    html = html.replace('</body>', '    <!-- SEO, GEO & Retention Tracking Engine -->\n    <script defer src="js/seo-tracking.js"></script>\n</body>');
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('✓ Successfully enhanced library SEO & Schema in:', file);
});
