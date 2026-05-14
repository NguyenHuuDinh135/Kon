# Phân công nhiệm vụ - Nhóm 5

## Thành viên

| STT | Họ tên | MSSV | Vai trò |
|-----|--------|------|---------|
| 1 | Nguyễn Hữu Định | 23115053122305 | Nhóm trưởng — Full-stack, AI/ML, DevOps |
| 2 | Trần Hiền | 23115053122312 | Frontend (Giao diện) |
| 3 | Trần Xuân Trường | 23115053122339 | Frontend (Giao diện) |
| 4 | Nguyễn Minh Tuệ | 23115053122342 | Backend + Database (phần nhẹ) |
| 5 | Nguyễn Quang Vinh | 23115053122346 | Backend + Database (phần nhẹ) |

---

## Phân công chi tiết

### Nguyễn Hữu Định (Nhóm trưởng) — Tham gia tất cả

| Module | Công việc cụ thể |
|--------|-----------------|
| Kiến trúc hệ thống | Thiết kế architecture, chọn tech stack, cấu hình Turborepo monorepo |
| Database | Thiết kế schema 20+ tables, PostgreSQL + pgvector, Alembic migrations |
| Backend API | FastAPI, JWT auth, rate limiting, 38+ endpoints |
| AI/ML Engine | 5 ML models (K-Means, Decision Tree, Logistic Regression, Linear Regression, Collaborative Filtering) |
| AI Agent | LangGraph ReAct agent, 7 MCP tools, AWS Bedrock integration |
| ETL Pipeline | Worker service, Kaggle datasets, APScheduler (4h retrain) |
| DevOps | Docker Compose, GitHub Actions CI/CD, Dockerfile |
| Frontend | Dashboard analytics, ML predictions pages, AI agent chat |
| Báo cáo | Viết báo cáo, tạo slides, diagrams |

---

### Trần Hiền — Frontend (Giao diện)

| Module | Công việc cụ thể |
|--------|-----------------|
| Storefront | Trang chủ, danh sách sản phẩm, chi tiết sản phẩm |
| Storefront | Trang đăng ký, đăng nhập (UI) |
| Storefront | Trang checkout, theo dõi đơn hàng |
| Dashboard | Giao diện quản lý đơn hàng (`/dashboard/orders`) |
| Dashboard | Giao diện quản lý khách hàng (`/dashboard/customers`) |
| UI Components | Xây dựng components tái sử dụng (cards, tables, forms) |

**Công nghệ sử dụng:** Next.js, React, Tailwind CSS, shadcn/ui

---

### Trần Xuân Trường — Frontend (Giao diện)

| Module | Công việc cụ thể |
|--------|-----------------|
| Storefront | Trang danh mục, trang khuyến mãi (deals) |
| Storefront | Trang hồ sơ cá nhân (profile) |
| Dashboard | Giao diện quản lý sản phẩm (`/dashboard/products`) |
| Dashboard | Giao diện campaigns (`/dashboard/campaigns`) |
| Dashboard | Giao diện notifications (`/dashboard/notifications`) |
| Dashboard | Trang settings (`/dashboard/settings`) |

**Công nghệ sử dụng:** Next.js, React, Tailwind CSS, shadcn/ui

---

### Nguyễn Minh Tuệ — Backend + Database (hỗ trợ)

| Module | Công việc cụ thể |
|--------|-----------------|
| Database | Hỗ trợ tạo bảng, viết SQL queries cho API |
| Backend | API endpoints cho products, orders (CRUD cơ bản) |
| Backend | API endpoints cho notifications |
| Testing | Viết test cases cho API (pytest) |
| Báo cáo | Hỗ trợ viết phần cơ sở dữ liệu trong báo cáo |

**Công nghệ sử dụng:** Python, FastAPI, SQLAlchemy, PostgreSQL

---

### Nguyễn Quang Vinh — Backend + Database (hỗ trợ)

| Module | Công việc cụ thể |
|--------|-----------------|
| Database | Hỗ trợ thiết kế và nhập dữ liệu mẫu |
| Backend | API endpoints cho customers, campaigns (CRUD cơ bản) |
| Backend | API auth (login/register — phần gọi service) |
| Testing | Viết test cases cho API (pytest) |
| Báo cáo | Hỗ trợ viết phần phân tích yêu cầu trong báo cáo |

**Công nghệ sử dụng:** Python, FastAPI, SQLAlchemy, PostgreSQL

---

## Tỷ lệ đóng góp

| Thành viên | Tỷ lệ | Ghi chú |
|------------|--------|---------|
| Nguyễn Hữu Định | 40% | Toàn bộ AI/ML, DevOps, kiến trúc + hỗ trợ tất cả modules |
| Trần Hiền | 15% | Frontend storefront + dashboard (orders, customers) |
| Trần Xuân Trường | 15% | Frontend storefront + dashboard (products, campaigns, notifications) |
| Nguyễn Minh Tuệ | 15% | Backend CRUD + testing + báo cáo |
| Nguyễn Quang Vinh | 15% | Backend CRUD + testing + báo cáo |

---

## Timeline tham khảo

| Tuần | Định | Hiền + Trường | Tuệ + Vinh |
|------|------|---------------|------------|
| 1-2 | Thiết kế kiến trúc, setup monorepo, database schema | Setup Next.js, học Tailwind/shadcn | Setup Python env, học FastAPI |
| 3-4 | ETL pipeline, ML models | Storefront pages (home, products, login) | API CRUD (products, orders) |
| 5-6 | AI Agent, LangGraph, embeddings | Dashboard pages (orders, customers, products) | API CRUD (customers, campaigns, auth) |
| 7-8 | DevOps (Docker, CI/CD), analytics | Dashboard pages (campaigns, notifications, settings) | Testing (pytest) |
| 9-10 | Tích hợp, fix bugs, tối ưu | Fix UI bugs, responsive | Viết báo cáo (CSDL, phân tích) |
| 11-12 | Hoàn thiện báo cáo, slides, demo | Hỗ trợ chụp screenshots | Hỗ trợ test, báo cáo |
