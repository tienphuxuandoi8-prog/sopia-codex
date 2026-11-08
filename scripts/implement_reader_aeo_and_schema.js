const fs = require('fs');

const aeoBoxHtml = `            <!-- AEO Direct Answer Box for Active Book (SOPHIA-SEO) -->
            <div id="reader-aeo-box" class="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed font-ui hidden">
              <div class="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 mb-1.5">
                <i data-lucide="sparkles" class="w-4 h-4 text-amber-600"></i>
                <span id="reader-aeo-title">Luận Đề Cốt Lõi Tác Phẩm (AEO Featured Snippet):</span>
              </div>
              <p id="reader-aeo-content" class="font-reading text-xs sm:text-sm italic text-stone-700 dark:text-stone-300">
                <!-- Injected dynamically by updateDynamicBookSEO -->
              </p>
            </div>
`;

// 1. CHÈN AEO BOX VÀO INDEX.HTML VÀ PUBLIC/INDEX.HTML
['index.html', 'public/index.html'].forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('id="reader-aeo-box"')) {
    html = html.replace(
      '<!-- Chapter Header -->',
      `${aeoBoxHtml}\n            <!-- Chapter Header -->`
    );
    fs.writeFileSync(file, html, 'utf8');
    console.log('✓ Inserted reader-aeo-box into:', file);
  } else {
    console.log('- reader-aeo-box already present in:', file);
  }
});

// 2. NÂNG CẤP UPDATE DYNAMIC BOOK SEO TRONG READER.JS
const readerFiles = [
  'js/reader.js',
  'js/pages/reader.js',
  'public/js/reader.js',
  'public/js/pages/reader.js'
];

const newUpdateDynamicBookSEOCode = `  updateDynamicBookSEO(book) {
    if (!book) return;
    try {
      const bookTitle = book.title || 'Tác Phẩm Triết Học';
      const authorName = book.author || 'Hiền Triết';
      const cleanTitle = bookTitle.replace(/\\s*\\(.*?\\)\\s*/g, '').trim();
      
      // 1. Chuẩn hóa Document Title (< 60 ký tự)
      const dynamicTitle = \`\${cleanTitle} — \${authorName} | Sophia Codex\`;
      document.title = dynamicTitle;

      // 2. Chuẩn hóa Meta Description (140 - 155 ký tự)
      let metaDesc = book.summary || book.annotation || '';
      metaDesc = metaDesc.replace(/[\\r\\n]+/g, ' ').trim();
      if (metaDesc.length > 152) {
        metaDesc = metaDesc.substring(0, 149).trim() + '...';
      } else if (metaDesc.length < 135) {
        metaDesc = \`Đọc toàn văn \${cleanTitle} của \${authorName} tại Sophia Codex. \${metaDesc}\`.trim();
        if (metaDesc.length > 152) metaDesc = metaDesc.substring(0, 149).trim() + '...';
      }

      const updateTag = (selector, attr, value) => {
        let el = document.querySelector(selector);
        if (el) {
          el.setAttribute(attr, value);
        } else {
          el = document.createElement('meta');
          const [key, val] = selector.replace(/[\\[\\]"]/g, '').split('=');
          el.setAttribute(key, val);
          el.setAttribute(attr, value);
          document.head.appendChild(el);
        }
      };

      updateTag('meta[name="description"]', 'content', metaDesc);
      updateTag('meta[property="og:title"]', 'content', dynamicTitle);
      updateTag('meta[property="og:description"]', 'content', metaDesc);
      updateTag('meta[property="og:type"]', 'content', 'book');
      
      const bookSlug = encodeURIComponent(book.id || book.slug);
      const bookUrl = \`https://www.vusitien.click/kinh-dien/\${bookSlug}\`;
      updateTag('meta[property="og:url"]', 'content', bookUrl);

      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (canonicalEl) {
        canonicalEl.setAttribute('href', bookUrl);
      }

      if (book.coverImage) {
        const fullImg = book.coverImage.startsWith('http') ? book.coverImage : \`https://www.vusitien.click/\${book.coverImage.replace(/^\\//, '')}\`;
        updateTag('meta[property="og:image"]', 'content', fullImg);
        updateTag('meta[name="twitter:image"]', 'content', fullImg);
      }
      updateTag('meta[name="twitter:title"]', 'content', dynamicTitle);
      updateTag('meta[name="twitter:description"]', 'content', metaDesc);

      // 3. Đồng bộ Clean URL trên trình duyệt
      if (window.history && window.history.pushState) {
        window.history.pushState({ bookId: book.id }, dynamicTitle, \`/kinh-dien/\${bookSlug}\`);
      }

      // 4. AEO Direct Answer Box Injection (40 - 55 từ)
      const aeoDefinitions = {
        'suy-tuong': 'Chủ nghĩa Khắc Kỷ trong "Suy Tưởng" của Marcus Aurelius tập trung vào nguyên lý Nhị phân quyền kiểm soát (Dichotomy of Control): Phân định rõ điều ta làm chủ (tâm trí, phản ứng cá nhân) và điều ta không thể làm chủ (ngoại cảnh, nghịch cảnh), qua đó gìn giữ pháo đài bình an nội tại.',
        'dao-duc-kinh': 'Triết lý Vô vi trong "Đạo Đức Kinh" của Lão Tử hướng dẫn con người hành động thuận theo quy luật tự nhiên (Đạo), buông bỏ ý chí cưỡng cầu ích kỷ, giữ tâm mềm dẻo như nước để vạn sự tự thành mà không hao tổn sinh lực.',
        'cong-hoa': 'Kiệt tác "Cộng Hòa" của Plato truy vấn bản chất của Công lý và sự khai minh của linh hồn: Vượt qua ảo giác cảm quan trong hang tối để chiêm nghiệm Ý niệm Chân - Thiện - Mỹ dưới ánh sáng lý tính và triết học.',
        'zarathustra': 'Tư tưởng Amor Fati và Ý chí hùng cường trong "Zarathustra Đã Nói Như Thế" của Nietzsche kêu gọi con người can đảm đón nhận mọi biến cố đau khổ của số phận, vượt thắng sự tầm thường bầy đàn để tự kiến tạo ý nghĩa cuộc đời.',
        'ban-ve-tu-do': 'Nguyên lý gây hại (Harm Principle) trong "Bàn Về Tự Do" của John Stuart Mill xác lập ranh giới đạo đức: Xã hội chỉ có quyền can thiệp chính đáng vào tự do cá nhân khi hành vi đó gây tổn hại trực tiếp đến quyền lợi của người khác.'
      };

      const aeoBox = document.getElementById('reader-aeo-box');
      const aeoContent = document.getElementById('reader-aeo-content');
      const aeoText = aeoDefinitions[book.id || book.slug] || metaDesc;

      if (aeoBox && aeoContent) {
        aeoContent.textContent = aeoText;
        aeoBox.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      }

      // 5. Dynamic Schema JSON-LD Injection (Book + Person + BreadcrumbList)
      const wikidataMap = {
        'suy-tuong': { authorSameAs: ['https://en.wikipedia.org/wiki/Marcus_Aurelius', 'https://www.wikidata.org/wiki/Q1430'], bookSameAs: ['https://en.wikipedia.org/wiki/Meditations', 'https://www.wikidata.org/wiki/Q660086'] },
        'dao-duc-kinh': { authorSameAs: ['https://en.wikipedia.org/wiki/Laozi', 'https://www.wikidata.org/wiki/Q9333'], bookSameAs: ['https://en.wikipedia.org/wiki/Tao_Te_Ching', 'https://www.wikidata.org/wiki/Q129772'] },
        'cong-hoa': { authorSameAs: ['https://en.wikipedia.org/wiki/Plato', 'https://www.wikidata.org/wiki/Q859'], bookSameAs: ['https://en.wikipedia.org/wiki/Republic_(Plato)', 'https://www.wikidata.org/wiki/Q123397'] },
        'zarathustra': { authorSameAs: ['https://en.wikipedia.org/wiki/Friedrich_Nietzsche', 'https://www.wikidata.org/wiki/Q9358'], bookSameAs: ['https://en.wikipedia.org/wiki/Thus_Spoke_Zarathustra', 'https://www.wikidata.org/wiki/Q193630'] },
        'ban-ve-tu-do': { authorSameAs: ['https://en.wikipedia.org/wiki/John_Stuart_Mill', 'https://www.wikidata.org/wiki/Q50020'], bookSameAs: ['https://en.wikipedia.org/wiki/On_Liberty', 'https://www.wikidata.org/wiki/Q1053913'] }
      };

      const meta = wikidataMap[book.id || book.slug] || {};
      const dynamicSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Book",
            "@id": \`\${bookUrl}#book\`,
            "name": cleanTitle,
            "url": bookUrl,
            "author": {
              "@type": "Person",
              "name": authorName,
              ...(meta.authorSameAs ? { "sameAs": meta.authorSameAs } : {})
            },
            ...(meta.bookSameAs ? { "sameAs": meta.bookSameAs } : {}),
            "inLanguage": "vi",
            "description": aeoText,
            "publisher": {
              "@type": "Organization",
              "name": "Sophia Codex",
              "url": "https://www.vusitien.click"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Trang Chủ", "item": "https://www.vusitien.click/" },
              { "@type": "ListItem", "position": 2, "name": "Thư Viện", "item": "https://www.vusitien.click/thu-vien" },
              { "@type": "ListItem", "position": 3, "name": cleanTitle, "item": bookUrl }
            ]
          }
        ]
      };

      let schemaScript = document.getElementById('dynamic-book-schema');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-book-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(dynamicSchema, null, 2);

    } catch (e) {
      console.warn('Lỗi cập nhật Dynamic SEO Meta:', e);
    }
  }`;

readerFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Replace updateDynamicBookSEO
  const startIdx = code.indexOf('updateDynamicBookSEO(book) {');
  if (startIdx !== -1) {
    const endIdx = code.indexOf('closeReader() {', startIdx);
    if (endIdx !== -1) {
      code = code.substring(0, startIdx) + newUpdateDynamicBookSEOCode.trim() + '\n\n  ' + code.substring(endIdx);
      console.log('✓ Successfully injected Dynamic Schema & AEO into updateDynamicBookSEO in:', file);
    }
  }

  // Hide aeo box & remove dynamic schema on closeReader
  if (!code.includes("document.getElementById('dynamic-book-schema');")) {
    code = code.replace(
      "window.history.pushState({}, document.title, '/');",
      `window.history.pushState({}, document.title, '/');
      const dynamicSchemaScript = document.getElementById('dynamic-book-schema');
      if (dynamicSchemaScript) dynamicSchemaScript.remove();
      const aeoBox = document.getElementById('reader-aeo-box');
      if (aeoBox) aeoBox.classList.add('hidden');`
    );
  }

  fs.writeFileSync(file, code, 'utf8');
});
