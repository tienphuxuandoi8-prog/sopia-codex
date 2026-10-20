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

  // Paragraphs
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h1') || p.startsWith('<h2') || p.startsWith('<h3') || p.startsWith('<blockquote') || p.startsWith('<ul') || p.startsWith('<img')) {
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
