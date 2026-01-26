# QA.QLKP - Hướng dẫn Setup Supabase Database

## Bước 1: Tạo Supabase Project

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng nhập hoặc tạo tài khoản mới
3. Click **"New Project"**
4. Điền thông tin:
   - **Name:** `qa-qlkp` (hoặc tên khác)
   - **Database Password:** Tạo password mạnh (lưu lại password này!)
   - **Region:** `Southeast Asia (Singapore)` or `Northeast Asia (Tokyo)`
5. Click **"Create new project"**
6. Đợi 2-3 phút để Supabase khởi tạo database

## Bước 2: Lấy API Keys

1. Trong project dashboard, click **Settings** (icon bánh răng) ở sidebar trái
2. Click **API** trong menu Settings
3. Copy 2 thông tin sau:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbG...` (chuỗi rất dài)

## Bước 3: Cấu hình Environment Variables

1. Tạo file `.env.local` trong thư mục `QA.QLKP`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Thay `your-project-id` và `your-anon-key-here` bằng giá trị thực tế từ Bước 2

**⚠️ LƯU Ý:** File `.env.local` đã được add vào `.gitignore` nên sẽ không bị push lên GitHub

## Bước 4: Chạy Database Migration

### Cách 1: Sử dụng SQL Editor (Khuyến nghị)

1. Trong Supabase dashboard, click **SQL Editor** ở sidebar trái
2. Click **"New query"**
3. Copy toàn bộ nội dung file **`migrations/001_initial_schema.sql`** và paste vào editor
4. Click **"Run"** (hoặc Ctrl+Enter)
5. Chờ vài giây → Xem kết quả "Success" ở dưới

6. Tạo query mới, copy nội dung file **`migrations/002_seed_data.sql`** và chạy tương tự

### Cách 2: Sử dụng Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-id

# Run migration
supabase db push
```

## Bước 5: Verify Database Setup

1. Trong Supabase dashboard, click **Table Editor** ở sidebar trái
2. Kiểm tra các bảng đã được tạo:
   - ✅ `materials` (2 rows)
   - ✅ `partners` (5 rows)
   - ✅ `transactions` (7 rows)
   - ✅ `users` (0 rows)

3. Click vào từng bảng và xem dữ liệu mẫu

4. Test trigger: Trong SQL Editor, chạy query sau để test auto-update stock:

```sql
-- Test Import (phải tăng stock)
INSERT INTO transactions (
  type, 
  material_id, 
  partner_id, 
  weight, 
  total_value, 
  category
) VALUES (
  'IMPORT',
  (SELECT id FROM materials WHERE code = 'PHE-LIEU'),
  (SELECT id FROM partners WHERE name = 'Kho Nhựa Hưng Thịnh'),
  1000,
  8000000,
  'MATERIAL'
);

-- Verify stock đã tăng
SELECT code, name, stock FROM materials WHERE code = 'PHE-LIEU';
```

## Bước 6: Kiểm tra RLS Policies

1. Click **Authentication** → **Policies** ở sidebar
2. Verify các policy "Allow all for development" đã được tạo cho:
   - materials
   - partners
   - transactions
   - users

## Troubleshooting

### Lỗi: "permission denied for schema public"
**Nguyên nhân:** RLS chưa được config đúng

**Giải pháp:** Chạy lại phần RLS trong `001_initial_schema.sql`

### Lỗi: "type already exists"
**Nguyên nhân:** Đã chạy migration 2 lần

**Giải pháp:** Drop types và chạy lại:
```sql
DROP TYPE IF EXISTS material_type CASCADE;
DROP TYPE IF EXISTS partner_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS expense_category CASCADE;
```

### Lỗi: "relation already exists"
**Nguyên nhân:** Bảng đã tồn tại

**Giải pháp:** Drop toàn bộ và reset:
```sql
-- ⚠️ CẢNH BÁO: XÓA TOÀN BỘ DỮ LIỆU!
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

## Next Steps

✅ Database setup hoàn tất!

➡️ **Tiếp theo:** Chuyển sang Phase 2 - API Layer Integration

Chạy lệnh để cài đặt Supabase client:
```bash
npm install @supabase/supabase-js
```
