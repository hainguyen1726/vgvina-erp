<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1tjOLoWAjY9KT_02rHSt41mgqr4zyEGtR

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## 🚀 Deployment & Synchronization (Dual-Edit Flow)

Dự án này sử dụng mô hình đồng bộ mã nguồn và deploy trực tiếp lên VPS (`116.118.45.67`) thông qua GitHub Actions và giao thức **Dual-Edit (Antigravity ↔ Hermes)**.

### 1. Quy trình tự động (Deploy từ máy Local)
Mỗi khi push code lên nhánh chính `main`, GitHub Actions sẽ tự động:
- Build ứng dụng Vite/React.
- Deploy (SFTP) đè thư mục kết quả `dist/` vào web root của OpenLiteSpeed trên VPS tại:
  `/home/admin/domains/baocao.vgvina.com/public_html`

### 2. Các script hỗ trợ:
- `deploy.sh` (Mac/Linux) & `deploy.ps1` (Windows): Tự động đẩy code lên GitHub và kích hoạt script deploy trên VPS qua SSH.
- `vps_deploy.sh` (Chạy trên VPS): Pull code từ GitHub, build tại chỗ và copy vào thư mục web của OpenLiteSpeed.

### 🔴 Quy tắc quan trọng cho AI Agent (MANDATORY)
Trước khi thực hiện bất kỳ phiên làm việc nào, các AI Agent bắt buộc phải tuân thủ **Safe Start Protocol** mô tả chi tiết tại:
👉 [.agents/skills/vgvina-deploy-flow/SKILL.md](file:///.agents/skills/vgvina-deploy-flow/SKILL.md)
*(Bao gồm các bước check remote branches của Hermes Agent `dev/hermes-*` trên VPS và merge trước khi code).*

