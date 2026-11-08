const fs = require('fs');

const blogRoutePath = 'src/modules/blog/routes.js';
let code = fs.readFileSync(blogRoutePath, 'utf8');

const targetStr = `    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const canonicalUrl = \`\${protocol}://\${host}/blog/\${post.slug}\`;`;

const replacementStr = `    const defaultHost = 'www.vusitien.click';
    const host = req.get('host') || defaultHost;
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';
    const canonicalUrl = \`\${protocol}://\${host}/blog/\${post.slug}\`;`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(blogRoutePath, code, 'utf8');
  console.log('✓ Successfully patched blog routes canonical protocol and host (LF)');
} else {
  const targetCRLF = targetStr.replace(/\n/g, '\r\n');
  if (code.includes(targetCRLF)) {
    code = code.replace(targetCRLF, replacementStr.replace(/\n/g, '\r\n'));
    fs.writeFileSync(blogRoutePath, code, 'utf8');
    console.log('✓ Successfully patched blog routes canonical protocol and host (CRLF)');
  } else {
    console.error('✗ Target string not found in', blogRoutePath);
  }
}
