const fs = require('fs');
const path = require('path');

const stPath = path.join(__dirname, 'data-suy-tuong.js');
let st = fs.readFileSync(stPath, 'utf8');
st = st.replace(/id:\s*"chap-(\d+)"/g, 'id: "suy-chap-$1"');
fs.writeFileSync(stPath, st, 'utf8');

const chPath = path.join(__dirname, 'data-cong-hoa.js');
let ch = fs.readFileSync(chPath, 'utf8');
ch = ch.replace(/id:\s*"chap-(\d+)"/g, 'id: "cong-chap-$1"');
fs.writeFileSync(chPath, ch, 'utf8');

console.log('Fixed IDs for Suy Tuong and Cong Hoa successfully.');
