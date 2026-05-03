# 🛡️ Kon: Autonomous AI ERP & CRM System

**Kon** là một hệ thống Đại lý AI Tự hành (Autonomous Agentic System) kết hợp quản trị doanh nghiệp (ERP) và quan hệ khách hàng (CRM). Bằng cách sử dụng **Northwind Traders** làm dữ liệu lõi và mở rộng thông qua các bộ dữ liệu hành vi (Behavioral Datasets), Kon có khả năng chủ động quan sát, phân tích rủi ro, lập kế hoạch marketing và thực thi các quyết định kinh doanh một cách tự động.

---

## 🏗️ Kiến trúc Hệ thống (Turborepo Monorepo)

Dự án được tổ chức theo chuẩn Clean Architecture trong một Monorepo để đảm bảo tính đồng nhất giữa giao diện, luồng xử lý AI và tầng dữ liệu.

### 📱 Apps (Tầng Ứng dụng Đầu cuối)
* **`apps/web`**: Giao diện điều hành Next.js 15 (App Router). Hiển thị báo cáo ERP, bản đồ nhiệt khách hàng và "Stream of Thoughts" (luồng tư duy) của AI.
* **`apps/api`**: Gateway FastAPI. Chịu trách nhiệm xác thực, quản lý phiên và điều phối các yêu cầu từ Web xuống AI Engine.
* **`apps/worker`**: Xử lý các tiến trình ngầm, đặc biệt là luồng **Direct ETL** nạp dữ liệu từ Kaggle thẳng vào PostgreSQL.

### 📦 Packages (Tầng Logic & Dùng chung)
* **`packages/ai-engine`**: "Bộ não" của hệ thống. Chứa các đồ thị LangGraph và logic gọi Gemini API (Flash/Pro) để phân tích và lập kế hoạch[cite: 2].
* **`packages/db-core`**: Quản trị PostgreSQL. Chứa định nghĩa schema (SQLAlchemy/Alembic) và xử lý truy vấn Hybrid Search bằng `pgvector`[cite: 2].
* **`packages/mcp-servers`**: "Cánh tay thực thi". Định nghĩa các công cụ (Tools) có ranh giới bảo mật để Agent tương tác với Database và môi trường ngoài[cite: 2].
* **`packages/shared`**: Định nghĩa Pydantic Models và TypeScript Interfaces dùng chung[cite: 2].

---

## 🗄️ Chiến lược Dữ liệu 3 Lớp (Data Topology)

Hệ thống sử dụng cơ sở dữ liệu PostgreSQL + `pgvector` được chia làm 3 lớp dữ liệu logic:

1. **Lõi ERP (Northwind Traders)**: Nguồn sự thật duy nhất (Single Source of Truth). Bao gồm 14 bảng quan hệ chuẩn hóa quản lý: `orders`, `customers`, `products`, `inventory`, `employees`[cite: 2].
2. **Lớp Làm giàu (Enrichment)**: Bổ sung dữ liệu nhân khẩu học (Thu nhập, Độ tuổi, Học vấn) vào trực tiếp bảng `customers` để AI phân loại khách hàng[cite: 2].
3. **Lớp Hành vi (E-commerce Behavior)**: Lưu trữ tại bảng `customer_behavior` (tần suất mua, kênh ưu thích, rủi ro rời bỏ). Bảng này chứa cột `vibe_vector` để thực hiện Semantic Search[cite: 2].

---

## 🧠 Vòng lặp Tự hành (LangGraph Agentic Loop)

Agent vận hành không ngừng nghỉ dựa trên các node tư duy sau[cite: 2]:
1. **Observe (Quan sát)**: Thông qua MCP Server, Agent truy vấn dữ liệu Northwind để lấy doanh thu realtime hoặc tình trạng tồn kho[cite: 2].
2. **Analyze (Phân tích)**: Gemini đánh giá dữ liệu hành vi kết hợp với ERP (VD: Phát hiện tệp khách hàng thu nhập cao nhưng tần suất mua giảm)[cite: 2].
3. **Plan (Lập kế hoạch)**: Sinh ra các đề xuất giải quyết (VD: Đề xuất mã giảm giá 15% cho danh mục sản phẩm yêu thích của tập khách hàng đó)[cite: 2].
4. **Act (Hành động)**: Gửi thông báo cần phê duyệt (Human-in-the-loop) lên Next.js Dashboard trước khi thực thi lệnh gửi email/cập nhật DB[cite: 2].

---

## 🛠️ MCP Servers: Giới hạn ranh giới (Guardrails)

Các công cụ được cung cấp cho AI thông qua `packages/mcp-servers`[cite: 2]:
* `northwind_query_tool`: Chỉ cho phép lệnh `SELECT` để đọc báo cáo, ngăn chặn việc AI tự ý xóa dữ liệu[cite: 2].
* `behavior_vector_search`: Tìm kiếm các tập khách hàng có tính cách tương đồng bằng thuật toán Cosine Similarity[cite: 2].
* `marketing_execution_tool`: Công cụ phác thảo chiến dịch marketing yêu cầu xác nhận từ quản trị viên (HITL)[cite: 2].

---

## 🚀 Hướng dẫn Khởi chạy (Dành cho Developer)

1. **Khởi tạo môi trường**: Tạo tệp `.env` dựa trên `.env.example` và điền `GOOGLE_API_KEY`, `KAGGLE_USERNAME`, `KAGGLE_KEY`[cite: 2].
2. **Dựng Database**:
   ```bash
   docker compose up db -d

    Chạy luồng ETL trực tiếp: Nạp 14 bảng Northwind và 2 Dataset vệ tinh vào PostgreSQL.
    Bash

    python apps/worker/main.py

    Khởi chạy Monorepo:
    Bash

    npm install
    npm run dev