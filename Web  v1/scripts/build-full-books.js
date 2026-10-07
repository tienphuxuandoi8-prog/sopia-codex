const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'js', 'books-data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Thư mục js/books-data đã sẵn sàng.');
