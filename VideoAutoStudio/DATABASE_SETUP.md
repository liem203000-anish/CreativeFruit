# Hướng dẫn thiết lập Database (PostgreSQL) trên Windows

## Cách 1: Sử dụng pgAdmin (Khuyên dùng)

1. Mở **pgAdmin 4** (cài đặt từ https://www.postgresql.org/download/windows/)
2. Kết nối đến PostgreSQL server (thường là localhost:5432)
3. Mở **Query Tool** (biểu tượng cái bảng)
4. Copy nội dung file `setup-db.sql` và chạy

## Cách 2: Sử dụng Command Line (psql)

1. Mở PowerShell hoặc CMD
2. Chạy lệnh (thay thế `your_postgres_password` bằng mật khẩu postgres của bạn):

```powershell
# Kết nối với user postgres
psql -U postgres -h localhost

# Sau đó chạy từng lệnh trong file setup-db.sql
```

Hoặc chạy trực tiếp:

```powershell
# Tạo user và database
psql -U postgres -h localhost -c "CREATE USER videoautostudio_user WITH PASSWORD 'videoautostudio_pass_2024';"
psql -U postgres -h localhost -c "CREATE DATABASE videoautostudio OWNER videoautostudio_user;"

# Chạy init.sql để tạo bảng
psql -U videoautostudio_user -d videoautostudio -h localhost -f backend/src/config/init.sql
```

## Cách 3: Sử dụng Docker (Dễ nhất)

Nếu chưa cài PostgreSQL, hãy dùng Docker:

```powershell
# Khởi động PostgreSQL với Docker
docker run -d \
  --name videoautostudio-postgres \
  -e POSTGRES_DB=videoautostudio \
  -e POSTGRES_USER=videoautostudio_user \
  -e POSTGRES_PASSWORD=videoautostudio_pass_2024 \
  -p 5432:5432 \
  postgres:16-alpine

# Chờ PostgreSQL khởi động (khoảng 10 giây)

# Chạy init.sql
docker exec -i videoautostudio-postgres psql -U videoautostudio_user -d videoautostudio < backend/src/config/init.sql
```

## Kiểm tra kết nối

Sau khi thiết lập, kiểm tra bằng cách:

```powershell
cd C:\Users\What do u think_\Downloads\CreativeFruit\VideoAutoStudio\backend
$env:NODE_ENV="development"
node src/server.js
```

Nếu thấy thông báo:
```
VideoAutoStudio API running on port 4000
Database connected: ...
```

Thì đã thành công!

## Lưu ý

- Nếu gặp lỗi "role does not exist", hãy tạo user trước
- Nếu gặp lỗi "database does not exist", hãy tạo database trước
- Đảm bảo PostgreSQL đang chạy (kiểm tra trong Services hoặc dùng `pg_isready`)
