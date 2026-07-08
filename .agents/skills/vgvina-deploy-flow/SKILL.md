---
name: vgvina-deploy-flow
description: Hướng dẫn đồng bộ mã nguồn dự án vgvina-erp và deploy code tĩnh lên VPS chạy OpenLiteSpeed + DirectAdmin qua GitHub Actions. Bao gồm workflow Antigravity (Local) và Hermes (VPS).
---

# 🚀 VGVINA-ERP Deployment & Synchronization Protocol

Tài liệu này định nghĩa quy trình làm việc và giao thức đồng bộ mã nguồn giữa Local (PC), GitHub, và Hermes Agent trên VPS.

---

## 🏗️ Kiến trúc Dual-Edit (Hermes & Antigravity)

```
Local (Windows)  <──── Git/GitHub ────>  VPS Production (Linux/CentOS 7)
   (Antigravity)     (Pull / Push)            (Hermes / VPS)
```

---

## 🖥️ Thông tin hạ tầng VPS

| Thông tin | Giá trị |
|---|---|
| **IP** | `116.118.45.67` |
| **OS** | CentOS 7 |
| **Web server** | OpenLiteSpeed + DirectAdmin |
| **Web root** | `/home/admin/domains/baocao.vgvina.com/public_html` |
| **Source code (Hermes)** | `/root/vgvina-erp-source` |
| **GitHub Repo** | `https://github.com/hainguyen1726/vgvina-erp.git` |
| **Nhánh chính** | `main` |
| **Docker** | v26.1.4 (dùng cho Supabase + TKMG stack, KHÔNG dùng cho vgvina-erp) |
| **Node.js** | Chưa cài (không cần cho GitHub Actions flow) |

> [!IMPORTANT]
> **vgvina-erp là React SPA thuần tĩnh** — KHÔNG cần Docker, KHÔNG cần Node.js trên VPS để chạy.
> Build được thực hiện bởi **GitHub Actions** trên Cloud. VPS chỉ nhận file `dist/` tĩnh.

---

## 🔄 Hai luồng Deploy

### Luồng 1: GitHub Actions (Khuyên dùng)
Khi push lên nhánh `main` → GitHub Actions tự động build → SSH đẩy `dist/` vào `/home/admin/domains/baocao.vgvina.com/public_html`.

**Không cần làm gì thêm sau khi push.**

### Luồng 2: Hermes build trực tiếp trên VPS (dùng khi cần xem nhanh kết quả)
Hermes sửa code trong `/root/vgvina-erp-source` → chạy `vps_deploy.sh` → web cập nhật ngay.

---

## 🔒 Quy tắc bắt buộc đối với AI Agent

### Quy tắc của Hermes (Trên VPS)

1. **Pull code mới nhất trước khi sửa:**
   ```bash
   cd /root/vgvina-erp-source
   git checkout main
   git pull origin main
   ```

2. **Tạo nhánh phát triển riêng (không sửa trực tiếp main):**
   ```bash
   git checkout -b dev/hermes-$(date +%Y%m%d-%H%M)
   ```

3. **Commit & Push sau khi sửa:**
   ```bash
   git add .
   git commit -m "hermes: [mô tả thay đổi]"
   git push origin dev/hermes-$(date +%Y%m%d-%H%M)
   ```

4. **Xem kết quả ngay trên web (không chờ GitHub Actions):**
   ```bash
   bash /root/vgvina-erp-source/vps_deploy.sh
   ```

### Quy tắc của Antigravity (Dưới Local)

1. **Pull code của Hermes về trước:**
   ```bash
   git fetch origin
   git pull origin main
   # Nếu Hermes có nhánh mới:
   git merge origin/dev/hermes-*
   ```

2. **Commit và push lên main để kích hoạt GitHub Actions:**
   ```bash
   git add .
   git commit -m "feat: [mô tả]"
   git push origin main
   ```
   → GitHub Actions sẽ tự build và deploy lên VPS trong ~2 phút.

---

## 🛠️ Lệnh hữu ích

### Kiểm tra tiến trình GitHub Actions
```bash
gh run list --repo hainguyen1726/vgvina-erp
gh run watch --repo hainguyen1726/vgvina-erp
```

### Deploy thủ công từ VPS (Hermes)
```bash
bash /root/vgvina-erp-source/vps_deploy.sh
```

### Deploy từ Local (kích hoạt VPS build qua SSH)
```bash
# Linux/Mac:
./deploy.sh

# Windows PowerShell:
.\deploy.ps1
```

### Kiểm tra dung lượng ổ đĩa (quan trọng!)
```bash
ssh root@116.118.45.67 "df -h /"
# Cảnh báo nếu Avail < 2GB!
# Dọn dẹp Docker nếu cần:
# docker builder prune -f && docker image prune -f
```

---

## ⚠️ Lưu ý quan trọng

1. **KHÔNG commit** `.env`, `.env.local`, credentials vào Git.
2. **LUÔN pull** trước khi sửa để tránh conflict.
3. **KHÔNG chạy `npm run build` trực tiếp trên VPS** nếu ổ đĩa dưới 3GB — để GitHub Actions xử lý.
4. **Sau khi copy file vào web root**, LiteSpeed tự nhận diện ngay, không cần restart.
5. **Ổ đĩa VPS**: Hiện tại ~9.5GB trống (sau khi dọn Docker). Theo dõi thường xuyên — Supabase + Docker có thể tích lũy logs.
