---
name: vgvina-deploy-flow
description: Hướng dẫn đồng bộ mã nguồn dự án vgvina-erp và deploy code tĩnh lên VPS chạy OpenLiteSpeed + DirectAdmin qua GitHub Actions. Bao gồm workflow Antigravity (Local) và Hermes (VPS).
---

# 🚀 VGVINA-ERP — Hướng dẫn toàn diện cho Hermes Agent

> Đọc toàn bộ file này trước khi bắt đầu làm việc. Mọi thông tin cần thiết đều có ở đây.

---

## 1. 🗺️ Tổng quan dự án

**VGVINA-ERP** là hệ thống quản lý nội bộ (ERP) web dành cho công ty VGVina, xây dựng bằng:

| Thành phần | Công nghệ |
|---|---|
| **Framework** | React 19 + TypeScript + Vite 6 |
| **Database / Auth** | Supabase (self-hosted tại `116.118.45.67`) |
| **Routing** | React Router DOM v7 |
| **Biểu đồ** | Recharts |
| **Xuất Excel** | xlsx-js-style |
| **Deploy** | GitHub Actions → OpenLiteSpeed + DirectAdmin |
| **URL Production** | https://baocao.vgvina.com |

---

## 2. 🖥️ Thông tin hạ tầng đầy đủ

### VPS vgvina (chứa mã nguồn & web)
| | |
|---|---|
| **IP** | `116.118.45.67` |
| **OS** | CentOS 7 |
| **Web server** | **OpenLiteSpeed** (chạy trực tiếp trên host, KHÔNG phải Docker) |
| **Panel quản lý** | DirectAdmin |
| **Web root** | `/home/admin/domains/baocao.vgvina.com/public_html` |
| **Mã nguồn (Hermes)** | `/root/vgvina-erp-source` |
| **Node.js** | Chưa cài (không cần cho production, chỉ cần nếu build tại VPS) |
| **Docker** | v26.1.4 — **DÙNG CHO Supabase + TKMG stack, KHÔNG LIÊN QUAN đến vgvina-erp** |

### VPS Hermes (nơi bạn đang chạy)
| | |
|---|---|
| **IP** | `157.10.198.146` |
| **Kết nối sang VPS vgvina** | `ssh vgvina-vps` |
| **SSH Key** | `/root/.ssh/id_ed25519_vgvina` |
| **SSH Config alias** | `Host vgvina-vps` → `116.118.45.67` |

### GitHub Repository
| | |
|---|---|
| **URL** | `https://github.com/hainguyen1726/vgvina-erp.git` |
| **Nhánh chính** | `main` |
| **Nhánh Hermes** | `dev/hermes-YYYYMMDD-HHMM` (tạo mới mỗi phiên làm việc) |
| **CI/CD** | GitHub Actions (`.github/workflows/deploy.yml`) |

---

## 3. 🔌 Kết nối SSH từ Hermes sang VPS vgvina

```bash
# Kết nối nhanh (alias đã cấu hình sẵn)
ssh vgvina-vps

# Chạy lệnh trực tiếp không cần mở shell
ssh vgvina-vps "lệnh cần chạy"

# Ví dụ: Xem mã nguồn
ssh vgvina-vps "ls /root/vgvina-erp-source/"

# Ví dụ: Xem web root
ssh vgvina-vps "ls /home/admin/domains/baocao.vgvina.com/public_html/"

# Ví dụ: Xem dung lượng ổ đĩa
ssh vgvina-vps "df -h /"
```

> [!IMPORTANT]
> SSH key dùng để kết nối là `/root/.ssh/id_ed25519_vgvina`.
> Alias `vgvina-vps` được cấu hình tại `/root/.ssh/config` trên VPS Hermes.

---

## 4. 📁 Cấu trúc mã nguồn (tại `/root/vgvina-erp-source`)

```
vgvina-erp-source/
├── App.tsx                    # Root component, định nghĩa tất cả routes
├── index.tsx                  # Entry point React
├── index.html                 # HTML template
├── index.css                  # Global CSS
├── types.ts                   # TypeScript types toàn cục
├── vite.config.ts             # Cấu hình Vite build
├── package.json               # Dependencies
│
├── pages/                     # Các trang chính (35 trang)
│   ├── Login.tsx              # Đăng nhập
│   ├── Dashboard.tsx          # Tổng quan
│   ├── IncomeExpense.tsx      # Thu chi (/thu-chi)
│   ├── Debt.tsx               # Công nợ (/cong-no)
│   ├── Partners.tsx           # Đối tác (/doi-tac)
│   ├── Warehouse.tsx          # Tồn kho (/bao-cao/ton-kho)
│   ├── SalesOrders.tsx        # Xuất nhập (/bao-cao/xuat-nhap)
│   ├── Returns.tsx            # Trả hàng (/bao-cao/tra-hang)
│   ├── PartnerStatement.tsx   # Sổ chi tiết công nợ
│   ├── DebtAgingReport.tsx    # Báo cáo tuổi nợ
│   ├── Admin.tsx              # Trang quản trị
│   ├── AdminAccounts.tsx      # Quản lý tài khoản kế toán
│   ├── AdminCategories.tsx    # Quản lý danh mục
│   ├── AdminPartners.tsx      # Quản lý đối tượng
│   ├── AdminRoles.tsx         # Quản lý vai trò & phân quyền
│   ├── AdminFacilities.tsx    # Quản lý chi nhánh
│   └── ...các báo cáo khác
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Layout chính (Sidebar + Header)
│   │   ├── Sidebar.tsx        # Menu điều hướng
│   │   └── Header.tsx         # Thanh tiêu đề
│   ├── modals/                # Các modal form nhập liệu
│   ├── ui/                    # UI components tái sử dụng
│   └── auth/
│       └── UserStatusGuard.tsx # Kiểm tra trạng thái tài khoản
│
├── src/
│   ├── supabaseClient.ts      # Khởi tạo Supabase client
│   ├── services/              # Các service giao tiếp với Supabase
│   │   ├── transactionService.ts
│   │   ├── partnerService.ts
│   │   ├── debtService.ts
│   │   ├── orderService.ts
│   │   ├── productService.ts
│   │   └── ...
│   └── utils/
│       ├── dateUtils.ts
│       ├── excelUtils.ts
│       └── numberToWords.ts   # Đọc số thành chữ (tiếng Việt)
│
├── contexts/
│   ├── BranchContext.tsx      # Context chứa user, chi nhánh, phân quyền
│   └── NotificationContext.tsx
│
├── supabase/                  # SQL migrations & scripts
├── .github/workflows/
│   └── deploy.yml             # CI/CD tự động build và deploy
├── vps_deploy.sh              # Script deploy thủ công trên VPS
├── deploy.sh                  # Script deploy từ Local (Linux)
└── deploy.ps1                 # Script deploy từ Local (Windows)
```

---

## 5. 🔑 Biến môi trường (`.env.local`)

File `.env.local` **KHÔNG được commit lên GitHub**. Cấu hình tại VPS vgvina:

```env
VITE_SUPABASE_URL=https://api-supabase.netslive.com
VITE_SUPABASE_ANON_KEY=<anon_key>
```

> [!CAUTION]
> KHÔNG bao giờ commit file `.env.local` hoặc bất kỳ API key nào lên Git.

---

## 6. 🔄 Workflow Deploy

### Luồng 1: GitHub Actions (Tự động — Khuyên dùng)

```
Hermes sửa code → git push → GitHub Actions build → deploy dist/ → LiteSpeed phục vụ
```

1. Hermes sửa file trong `/root/vgvina-erp-source`
2. Push lên GitHub (nhánh phát triển)
3. Antigravity (Local) merge vào `main` và push
4. GitHub Actions tự động:
   - `npm ci` → `npm run build` → tạo thư mục `dist/`
   - Copy `dist/` sang `/home/admin/domains/baocao.vgvina.com/public_html` trên VPS
5. LiteSpeed nhận diện file mới ngay lập tức, không cần restart

### Luồng 2: Hermes deploy trực tiếp (Xem kết quả nhanh)

```bash
ssh vgvina-vps "bash /root/vgvina-erp-source/vps_deploy.sh"
```

> [!WARNING]
> Luồng 2 yêu cầu Node.js được cài trên VPS vgvina. Hiện tại **Node.js chưa cài**.
> Nếu cần, cài Node.js 20 trên CentOS 7 bằng nvm:
> ```bash
> ssh vgvina-vps "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && source ~/.bashrc && nvm install 20 && nvm use 20"
> ```

---

## 7. 🤖 Quy trình làm việc của Hermes Agent

### Bước 1: Chuẩn bị trước khi sửa
```bash
ssh vgvina-vps "
  cd /root/vgvina-erp-source &&
  git checkout main &&
  git pull origin main &&
  git checkout -b dev/hermes-$(date +%Y%m%d-%H%M)
"
```

### Bước 2: Sửa code
```bash
# Sửa file trực tiếp trên VPS vgvina qua SSH
ssh vgvina-vps "nano /root/vgvina-erp-source/pages/TrangCanSua.tsx"

# Hoặc dùng sed để thay thế nhanh
ssh vgvina-vps "sed -i 's/text cũ/text mới/g' /root/vgvina-erp-source/pages/TrangCanSua.tsx"
```

### Bước 3: Commit và push lên GitHub
```bash
BRANCH_NAME="dev/hermes-$(date +%Y%m%d-%H%M)"
ssh vgvina-vps "
  cd /root/vgvina-erp-source &&
  git add . &&
  git commit -m 'hermes: [mô tả thay đổi ngắn gọn]' &&
  git push origin $BRANCH_NAME
"
```

### Bước 4: Thông báo cho Antigravity
Sau khi push xong, thông báo cho Antigravity nhánh vừa push để merge vào `main` và kích hoạt GitHub Actions deploy.

---

## 8. ⚙️ Các lệnh thường dùng

### Kiểm tra trạng thái

```bash
# Xem file trong web root (kiểm tra deploy đã xong chưa)
ssh vgvina-vps "ls -la /home/admin/domains/baocao.vgvina.com/public_html/"

# Kiểm tra dung lượng ổ đĩa VPS vgvina
ssh vgvina-vps "df -h /"

# Xem log LiteSpeed
ssh vgvina-vps "tail -50 /usr/local/lsws/logs/error.log"

# Xem trạng thái git hiện tại
ssh vgvina-vps "cd /root/vgvina-erp-source && git log --oneline -10 && git status"
```

### Git operations

```bash
# Cập nhật code mới nhất từ GitHub
ssh vgvina-vps "cd /root/vgvina-erp-source && git pull origin main"

# Xem tất cả nhánh
ssh vgvina-vps "cd /root/vgvina-erp-source && git branch -a"

# Xem diff trước khi commit
ssh vgvina-vps "cd /root/vgvina-erp-source && git diff"
```

### Docker (Supabase stack — KHÔNG LIÊN QUAN đến vgvina-erp)
```bash
# Xem các container đang chạy (để tham khảo, không cần động vào)
ssh vgvina-vps "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Dọn dẹp Docker nếu ổ đĩa gần đầy
ssh vgvina-vps "docker builder prune -f && docker image prune -f"
```

---

## 9. ⚠️ Lưu ý quan trọng

1. **KHÔNG commit** `.env.local` hoặc bất kỳ credentials nào lên Git.
2. **LUÔN `git pull`** trước khi bắt đầu sửa để tránh conflict với Antigravity.
3. **KHÔNG động vào** các Docker container Supabase hoặc TKMG đang chạy trên VPS vgvina (chúng không liên quan đến vgvina-erp).
4. **Theo dõi ổ đĩa**: VPS vgvina hiện còn ~9.5GB. Nếu dưới 3GB, dọn Docker cache trước.
5. **LiteSpeed KHÔNG cần restart** sau khi copy file mới vào web root — nó tự phục vụ file mới ngay.
6. **KHÔNG chạy `npm install` hay `npm run build` trực tiếp** trên VPS nếu chưa cài Node.js — sẽ gây lỗi.

---

## 10. 🗄️ Supabase Database

- **URL:** `https://api-supabase.netslive.com` (self-hosted trên VPS `116.118.45.67`)
- **Client:** Khởi tạo trong `/root/vgvina-erp-source/src/supabaseClient.ts`
- **Bảng chính:**
  - `financial_transactions` — Thu chi
  - `partners` — Đối tác / Khách hàng / NCC
  - `orders` / `order_items` — Đơn hàng
  - `products` — Hàng hóa
  - `facilities` — Chi nhánh
  - `users` — Người dùng nội bộ
  - `roles` / `permissions` — Phân quyền RBAC
