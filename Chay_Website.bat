@echo off
chcp 65001 >nul
title Sophia Codex — Khởi Động Hệ Thống Máy Chủ

cd /d "%~dp0Web  v1"

echo ====================================================================
echo               🏛️  SOPHIA CODEX - THƯ VIỆN MINH TRIẾT
echo ====================================================================
echo.
echo  Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Không tìm thấy Node.js trên máy tính!
    echo  👉 Vui lòng cài đặt Node.js từ https://nodejs.org để chạy máy chủ.
    pause
    exit /b 1
)

echo  ✅ Đã tìm thấy Node.js.
echo  🚀 Đang khởi động máy chủ tại: http://localhost:3000
echo.
echo  --------------------------------------------------------------------
echo   👑 Tài khoản Quản trị mặc định:
echo      • Email:    admin@sophiacodex.vn
echo      • Mật khẩu: Admin@Sophia2026!
echo.
echo   📖 Tài khoản Độc giả mẫu:
echo      • Email:    docgia@sophiacodex.vn
echo      • Mật khẩu: Docgia@Sophia2026!
echo.
echo   ✨ Hoặc bấm "Đăng ký" trên trang web để tạo tài khoản độc giả mới!
echo  --------------------------------------------------------------------
echo.
echo  🌐 Đang tự động mở trình duyệt...

start "" "http://localhost:3000"

node src/server.local.js

pause
