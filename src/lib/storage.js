const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('../middleware/errorHandler');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Tải ảnh lên Supabase Storage hoặc lưu cục bộ nếu không cấu hình Supabase
 * @param {Buffer} fileBuffer - Buffer của file
 * @param {string} originalFilename - Tên file gốc
 * @param {string} mimeType - Định dạng file
 * @param {string} folder - Thư mục lưu trữ (mặc định: 'covers')
 * @returns {Promise<string>} URL public của ảnh đã tải lên
 */
async function uploadImage(fileBuffer, originalFilename, mimeType, folder = 'covers') {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AppError(`Định dạng file không được hỗ trợ: ${mimeType}. Chỉ cho phép jpeg, png, webp.`, 400);
  }

  const ext = originalFilename.split('.').pop().toLowerCase();
  // Tạo tên file duy nhất để tránh trùng lặp
  const uniqueFilename = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  if (supabase) {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(uniqueFilename, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new AppError('Lỗi tải ảnh lên Supabase: ' + error.message, 500);
    }

    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(uniqueFilename);

    return publicUrlData.publicUrl;
  } else {
    // Dự phòng: Lưu cục bộ nếu chưa cấu hình Supabase
    const uploadDir = path.join(__dirname, '../../public/assets/uploads', folder);
    
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`);
    fs.writeFileSync(filePath, fileBuffer);

    // Trả về URL đường dẫn tĩnh
    const relativePath = filePath.split(path.join(__dirname, '../../public'))[1].replace(/\\/g, '/');
    return relativePath;
  }
}

module.exports = {
  uploadImage
};
