---
name: vgvina-deploy-flow
description: Hướng dẫn đồng bộ mã nguồn dự án vgvina-erp và deploy code tĩnh lên VPS chạy Caddy trong Docker qua GitHub Actions. Bao gồm workflow Antigravity (Local) và Hermes (VPS).
---

# 🚀 VGVINA-ERP Deployment & Synchronization Protocol

Tài liệu này định nghĩa quy trình làm việc và giao thức đồng bộ mã nguồn giữa Local (PC), GitHub, và Hermes Agent trên VPS nhằm đảm bảo không xảy ra xung đột code (conflict) khi sửa đổi từ nhiều máy khác nhau.

---

## 🏗️ Kiến trúc Dual-Edit (Hermes & Antigravity)

```
Local (Windows)  <──── Git/GitHub ────>  VPS Production (Linux)
   (Antigravity)     (Pull / Push)            (Hermes / VPS)
```

- **Hạ tầng VPS:**
  - IP: `116.118.45.67`
  - Thư mục chạy web chính (Caddy phục vụ): `/var/www/baocao.vgvina.com/dist`
  - Thư mục mã nguồn gốc (để Hermes chỉnh sửa): `/var/www/vgvina-erp-source`
  - Máy chủ web: Caddy chạy trong Docker container, mount thư mục `/var/www/baocao.vgvina.com/dist` từ host vào container.
- **GitHub Actions (CI/CD):**
  - Tự động build dự án và đẩy thư mục `dist` lên VPS thông qua SSH/SFTP.

---

## 🔒 Quy tắc bắt buộc đối với AI Agent (Antigravity & Hermes)

### 1. Quy tắc hoạt động của Hermes (Trên VPS)

Khi Hermes (hoặc bất kỳ AI nào chạy trực tiếp trên VPS) thực hiện chỉnh sửa:

1. **Kiểm tra và Pull code mới nhất từ GitHub:**
   ```bash
   cd /var/www/vgvina-erp-source
   git checkout main
   git pull origin main
   ```

2. **Chia nhánh phát triển an toàn:** Luôn tạo nhánh phát triển riêng để tránh ghi đè trực tiếp lên nhánh `main`:
   ```bash
   git checkout -b dev/hermes-$(date +%Y%m%d-%H%M)
   ```

3. **Commit & Push ngay sau khi sửa:**
   ```bash
   git add .
   git commit -m "hermes: [mô tả ngắn gọn thay đổi]"
   git push origin dev/hermes-$(date +%Y%m%d-%H%M)
   ```

### 2. Quy tắc hoạt động của Antigravity (Dưới Local)

Khi Antigravity (hoặc bất kỳ AI nào chạy dưới máy Local) thực hiện chỉnh sửa và deploy:

1. **Kéo code mới nhất từ GitHub:**
   ```bash
   git fetch origin
   git pull origin main
   ```

2. **Gộp nhánh phát triển của Hermes (nếu có):** Nếu Hermes có push nhánh phát triển mới, hãy gộp nhánh đó vào local chính thức:
   ```bash
   git merge origin/dev/hermes-*
   ```

3. **Deploy lên VPS:** Sau khi commit và push lên nhánh `main` ở local, GitHub Actions sẽ tự động build và cập nhật thư mục `/var/www/baocao.vgvina.com/dist` trên VPS. Bạn không cần build thủ công.
   ```bash
   git add .
   git commit -m "feat: [mô tả]"
   git push origin main
   ```

---

## 🛠️ Các lệnh Command hữu ích cho AI Agent

### Kiểm tra trạng thái deploy trên GitHub Actions (dùng GitHub CLI)
```bash
gh run list --repo hainguyen1726/vgvina-erp
```

### Xem log của Docker Container Caddy trên VPS
```bash
docker compose logs --tail 100 -f caddy
# Hoặc lệnh docker container nếu chạy riêng lẻ:
docker logs --tail 100 -f caddy-container-name
```

---

## 📋 Trạng thái hiện tại (Cập nhật: 2026-07-08)

- **Nhánh chính:** `main`
- **Địa chỉ GitHub:** https://github.com/hainguyen1726/vgvina-erp.git
- **CI/CD Configuration:** Đã thiết lập thành công tại [.github/workflows/deploy.yml](file:///f:/0. Code/vgvina-erp/.github/workflows/deploy.yml)
- **Secrets đã cấu hình trên GitHub:**
  - `SSH_HOST`: `116.118.45.67`
  - `SSH_USER`: `root`
  - `SSH_PRIVATE_KEY`: Khóa SSH bảo mật chuyên dùng để deploy.
- **SSH Key trên VPS:** Đã thêm khóa Public tương ứng của GitHub Actions vào file `~/.ssh/authorized_keys` của VPS.

---

## ⚠️ Lưu ý quan trọng

1. **KHÔNG bao giờ** commit các file cấu hình môi trường `.env`, `.env.local` vào Git.
2. **LUÔN LUÔN** thực hiện `git pull` trước khi chỉnh sửa để tránh conflict.
3. **KHÔNG** chạy lệnh `npm run build` trên VPS để tránh gây quá tải tài nguyên RAM/CPU làm ảnh hưởng đến dịch vụ đang chạy. Hãy để GitHub Actions gánh vác phần build này.
