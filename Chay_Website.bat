@echo off
chcp 65001 >nul
title Sophia Codex — Khởi Động Hệ Thống Máy Chủ

echo ====================================================================
echo               🏛️  SOPHIA CODEX - THƯ VIỆN MINH TRIẾT
echo ====================================================================
echo.
echo  Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Không tìm thấy Node.js trên máy tính!
    echo  👉 Vui lòng cài đặt Node.js từ https://nodejs.org để chạy máy chủ.
    echo  (Bạn vẫn có thể mở trực tiếp file index.html để xem giao diện)
    pause
    exit /b 1
)

echo  ✅ Đã tìm thấy Node.js.
echo  🚀 Đang khởi động máy chủ tại: http://localhost:3000
echo.
echo  --------------------------------------------------------------------
echo   👑 Tài khoản Quản trị:
echo      • Dành riêng cho Quản trị viên (Admin) sở hữu website
echo.
echo   📖 Tài khoản Độc giả:
echo      • Bấm "Đăng ký" trên trang web để tạo tài khoản độc giả mới!
echo  --------------------------------------------------------------------
echo.
echo  🌐 Đang tự động mở trình duyệt...

start "" "http://localhost:3000"

node src/server.local.js

pause
