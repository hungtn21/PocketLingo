# Pocket Lingo
## Cài đặt
### 1. Clone repository
```
git clone https://github.com/hungtn21/PocketLingo.git
cd PocketLingo
```
### 2. Cài đặt Backend (Django)
- Tạo môi trường ảo:
```
python -m venv env
.\env\Scripts\Activate.ps1
```
- Cài đặt dependencies:
```
cd backend
pip install -r requirements.txt
```
(Nếu cài thêm package, update vào file requirements.txt)
```
pip freeze > requirements.txt
```

- Tạo file .env để set up môi trường với các trường tương tự file .env.example
- Khi tạo bảng mới --> makemigrations
```
python manage.py makemigrations
```
- Áp dụng thay đổi vào database gốc
```
python manage.py migrate
```
- Chạy server
```
python manage.py runserver
```
Backend chạy mặc định tại: http://localhost:8000/


### 2. Cài đặt Frontend
- Di chuyển vào thư mục frontend, sau đó cài đặt các dependencies
```
cd frontend
npm install
```
- Chạy server:
```
npm run dev
```
Frontend sẽ chạy tại http://localhost:5173/

## Lưu ý
- Đảm bảo cài đặt **đầy đủ dependencies**
- Backend và frontend cần chạy **đồng thời**
- Nếu gặp lỗi liên quan đến **không connect được đến database** hay **SSL certificate**, kiểm tra xem file **CA certificate (ca.pem)** đã có trong thư mục backend chưa. Ngoài ra, kiểm tra lại các biến môi trường trong file .env

