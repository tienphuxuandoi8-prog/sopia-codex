const fs = require('fs');

const routesPath = 'src/modules/blog/routes.js';
let code = fs.readFileSync(routesPath, 'utf8');

const targetStr = `    // Đọc template blog-detail.html
    const templatePath = path.join(viewsDir, 'blog-detail.html');`;

const newCode = `    // Lấy danh sách 3 bài viết liên quan
    let relatedHtml = '';
    try {
      const allPosts = dbService.getAllBlogPosts({ status: 'PUBLISHED', limit: 12 });
      const related = allPosts
        .filter(p => p.id !== post.id && p.slug !== post.slug)
        .sort((a, b) => {
          const aMatch = a.category === post.category ? 1 : 0;
          const bMatch = b.category === post.category ? 1 : 0;
          return bMatch - aMatch;
        })
        .slice(0, 3);

      if (related.length > 0) {
        relatedHtml = \`
        <section class="mt-14 pt-8 border-t border-stone-200 dark:border-emerald-900/60">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-heading font-bold text-xl text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <i data-lucide="compass" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
              Chiêm Nghiệm Tiếp Theo Cùng Chủ Đề
            </h3>
            <a href="/blog" class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
              Tất cả bài viết &rarr;
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            \${related.map(r => \`
              <article class="group bg-white dark:bg-emerald-950/40 rounded-xl border border-stone-200 dark:border-emerald-800/60 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                <a href="/blog/\${escapeHtml(r.slug)}" class="block aspect-video overflow-hidden relative">
                  <img src="\${escapeHtml(r.cover_image || '/assets/blog/blog-default.jpg')}" alt="\${escapeHtml(r.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onerror="this.src='/assets/blog/blog-default.jpg';">
                  <span class="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/80 backdrop-blur-md text-amber-300 rounded-full border border-amber-500/30">
                    \${escapeHtml(r.category || 'Triết học')}
                  </span>
                </a>
                <div class="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 class="font-heading font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      <a href="/blog/\${escapeHtml(r.slug)}">\${escapeHtml(r.title)}</a>
                    </h4>
                    <p class="font-reading text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      \${escapeHtml(r.summary || '')}
                    </p>
                  </div>
                  <div class="pt-3 mt-3 border-t border-stone-100 dark:border-emerald-900/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                    <span>\${r.reading_time || 5} phút đọc</span>
                    <a href="/blog/\${escapeHtml(r.slug)}" class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      Đọc tiếp &rarr;
                    </a>
                  </div>
                </div>
              </article>
            \`).join('')}
          </div>
        </section>
        \`;
      }
    } catch(e) {
      console.warn('Lỗi tạo related posts:', e.message);
    }

    // Đọc template blog-detail.html
    const templatePath = path.join(viewsDir, 'blog-detail.html');`;

if (!code.includes('Chiêm Nghiệm Tiếp Theo Cùng Chủ Đề')) {
  code = code.replace(targetStr, newCode);
  code = code.replace(
    ".replace('<!-- FAQ_SECTION_HTML -->', faqHtml);",
    ".replace('<!-- FAQ_SECTION_HTML -->', faqHtml)\n      .replace('<!-- RELATED_POSTS_SECTION_HTML -->', relatedHtml);"
  );
  fs.writeFileSync(routesPath, code, 'utf8');
  console.log('✅ Updated src/modules/blog/routes.js successfully!');
} else {
  console.log('Already updated');
}
