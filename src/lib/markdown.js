/**
 * SOPHIA CODEX - LIGHTWEIGHT ZERO-DEPENDENCY MARKDOWN PARSER
 * Tối ưu hóa siêu tốc, không phụ thuộc thư viện ngoài, tương thích 100% mọi môi trường Node.js & Serverless
 */

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseMarkdown(md) {
  if (!md) return '';

  let html = md.replace(/\r\n/g, '\n');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" loading="lazy">');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>');

  // Inline Code `code`
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

  // Lists (- or *)
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // Tables (| header | ... |)
  html = html.replace(/((?:^\|.+?\|\s*(?:\n|$)){2,})/gm, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return tableMatch;
    if (!lines[1].includes('---')) return tableMatch;

    const parseCells = (row) => row.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    const headerCells = parseCells(lines[0]);
    const thead = `<thead><tr>${headerCells.map(c => `<th class="border border-stone-200 dark:border-emerald-800 px-4 py-2.5 bg-stone-100/90 dark:bg-emerald-950 font-semibold text-stone-900 dark:text-stone-100">${c}</th>`).join('')}</tr></thead>`;

    const bodyRows = lines.slice(2).map(row => {
      const cells = parseCells(row);
      return `<tr class="hover:bg-stone-50/50 dark:hover:bg-emerald-900/30 transition-colors">${cells.map(c => `<td class="border border-stone-200 dark:border-emerald-800/60 px-4 py-2.5 text-stone-700 dark:text-stone-300 leading-relaxed">${c}</td>`).join('')}</tr>`;
    }).join('');
    const tbody = `<tbody>${bodyRows}</tbody>`;

    return `<div class="overflow-x-auto my-6"><table class="w-full text-left border-collapse border border-stone-200 dark:border-emerald-800 rounded-xl overflow-hidden text-sm">${thead}${tbody}</table></div>\n`;
  });

  // Paragraphs
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h1') || p.startsWith('<h2') || p.startsWith('<h3') || p.startsWith('<blockquote') || p.startsWith('<ul') || p.startsWith('<img') || p.startsWith('<div class="overflow-x-auto') || p.startsWith('<table')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).filter(Boolean).join('\n');

  return html;
}

module.exports = {
  parse: parseMarkdown,
  escapeHtml
};
