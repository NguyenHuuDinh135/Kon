# Demo Prompts cho AI Agent

Danh sách prompts để demo tất cả 7 tools của AI Agent trong buổi báo cáo.
Mở trang `/dashboard/agent` và nhập từng prompt bên dưới.

---

## 1. Query Database — Truy vấn SQL tổng quan

```
Cho tôi biết tổng quan về dữ liệu: có bao nhiêu đơn hàng, bao nhiêu khách hàng, và doanh thu tổng là bao nhiêu?
```

**Kết quả mong đợi:** Agent dùng `query_database` để SELECT COUNT từ bảng orders, customers, tính SUM revenue.

---

## 2. Customer Profile — Hồ sơ khách hàng chi tiết

```
Cho tôi xem hồ sơ chi tiết của khách hàng số 100, bao gồm mức độ rủi ro rời bỏ và hành vi mua hàng.
```

**Kết quả mong đợi:** Agent dùng `get_customer_profile` trả về tenure, satisfaction, orders, churn probability, segment.

---

## 3. Churn Risk Summary — Tổng quan rủi ro churn

```
Tình hình churn hiện tại như thế nào? Có bao nhiêu khách hàng đang ở mức rủi ro cao?
```

**Kết quả mong đợi:** Agent dùng `get_churn_risk_summary` trả về thống kê HIGH/MEDIUM/LOW risk, tỷ lệ churn, satisfaction trung bình.

---

## 4. Revenue Insights — Phân tích doanh thu

```
Phân tích xu hướng doanh thu gần đây và cho biết top 5 danh mục sản phẩm bán chạy nhất.
```

**Kết quả mong đợi:** Agent dùng `get_revenue_insights` trả về monthly revenue trend + top categories.

---

## 5. Product Recommendations — Gợi ý sản phẩm

```
Gợi ý sản phẩm cho khách hàng có ID "0015a0a23d0d0b8a5b tried exploring4c17a06e2b1e" dựa trên lịch sử mua hàng.
```

> **Lưu ý:** Nếu không biết customer_id Olist, dùng prompt sau thay thế:

```
Hãy tìm một khách hàng trong hệ thống Olist đã mua hàng và gợi ý sản phẩm cho họ.
```

**Kết quả mong đợi:** Agent dùng `query_database` tìm customer_id → `get_product_recommendations` trả về co-purchase recommendations.

---

## 6. Campaign Suggestion — Đề xuất chiến dịch marketing

```
Đề xuất một chiến dịch marketing để giữ chân những khách hàng có nguy cơ rời bỏ cao (churn > 70%).
```

**Kết quả mong đợi:** Agent dùng `suggest_campaign` với segment "high_churn" → trả về chi tiết campaign (target, insight, recommendation, channel, urgency).

---

## 7. Semantic Search — Tìm kiếm khách hàng bằng ngôn ngữ tự nhiên

```
Tìm cho tôi những khách hàng chi tiêu nhiều nhưng lâu không quay lại mua hàng.
```

**Kết quả mong đợi:** Agent dùng `search_similar_customers` với pgvector cosine similarity → trả về danh sách khách hàng matching.

---

## 8. Phân tích phức hợp (Multi-tool)

```
Phân tích nhóm khách hàng VIP: họ là ai, hành vi mua sắm ra sao, và đề xuất chiến dịch loyalty cho nhóm này.
```

**Kết quả mong đợi:** Agent dùng nhiều tools liên tiếp:
1. `query_database` — lọc khách VIP
2. `get_customer_profile` — xem chi tiết vài khách
3. `suggest_campaign` segment "vip" — đề xuất chiến dịch

---

## 9. So sánh ML models

```
So sánh kết quả dự đoán của các mô hình ML cho khách hàng số 500: Decision Tree nói gì, Logistic Regression nói gì?
```

**Kết quả mong đợi:** Agent dùng `query_database` SELECT từ customer_churn WHERE CustomerID=500 → so sánh DT_Label, Churn_Prediction, Churn_Probability.

---

## 10. Câu hỏi chiến lược tổng hợp

```
Dựa trên dữ liệu hiện tại, hãy đưa ra 3 khuyến nghị chiến lược kinh doanh cụ thể để tăng doanh thu và giảm tỷ lệ khách hàng rời bỏ trong quý tới.
```

**Kết quả mong đợi:** Agent kết hợp nhiều tools (revenue insights + churn summary + campaign suggestion) để đưa ra phân tích tổng hợp và khuyến nghị actionable.

---

## Tips khi demo

1. **Bắt đầu từ đơn giản → phức tạp** (prompt 3 → 1 → 2 → 4 → 6 → 7 → 8 → 10)
2. **Chờ response xong** rồi hỏi tiếp — agent có context từ chat trước
3. **Nếu Bedrock timeout**, agent sẽ tự fallback sang Ollama (hiển thị trong log)
4. **Semantic search (prompt 7)** cần embeddings đã được generate — nếu lỗi thì skip
5. **Highlight khi demo:** agent tự chọn tool phù hợp, không cần user chỉ định
