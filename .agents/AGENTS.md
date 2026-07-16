# Antigravity Safety Rules

## 🛑 NGUYÊN TẮC AN TOÀN TUYỆT ĐỐI (CRITICAL SAFETY PROTOCOLS)

1. **Cấm tuyệt đối lệnh xóa hàng loạt không xác định:** Không bao giờ chạy các lệnh xóa dạng `rm -rf /*`, `rm -rf $VAR/*`, hoặc bất kỳ biến chưa xác định nào trên môi trường VPS hay Local.
2. **Nguyên tắc biên dịch chuỗi:** 
   - Khi chạy lệnh SSH/Bash qua PowerShell, **không bao giờ** viết biến chưa được gán giá trị rõ ràng trong chuỗi nháy kép.
   - Khi cần dùng biến môi trường ở Remote, hãy viết script `.sh` độc lập rồi upload lên chạy, thay vì viết inline commands.
3. **Double Check trước khi chạy lệnh phá hủy:** Mọi lệnh có từ khóa `rm`, `delete`, `drop`, `truncate` phải được in ra màn hình để tự kiểm tra (Self-audit) trước khi thực thi thực tế.
