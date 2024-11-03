const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const connectToDatabase = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('images'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 設定 session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// 連接到 MongoDB
connectToDatabase();

// 訂位模型
const reservationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    highChair: { type: Number, default: 0 },
    notes: { type: String }
});

const Reservation = mongoose.model('Reservation', reservationSchema, 'bookings');

// 主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/reservations', async (req, res) => {
    const { name, phone, email, gender, date, time, adults, children, highChair, notes } = req.body;

    // 驗證電話格式
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: '電話格式不正確，請使用台灣手機格式' });
    }

    // 驗證日期是否選擇今天以前
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
        return res.status(400).json({ message: '日期不能選擇今天以前' });
    }

    // 驗證兒童椅數量是否超過小孩數量
    if (children > 0 && highChair > children) {
        return res.status(400).json({ message: '兒童椅數量不能大於小孩數量' });
    }

    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: '電子郵件格式不正確' });
    }

    // 檢查是否選擇了時間
    if (!time || time.trim() === "") {
        return res.status(400).json({ message: '請選擇用餐時間。' });
    }

    try {
        const reservation = new Reservation({ name, phone, email, gender, date, time, adults, children, highChair, notes });
        await reservation.save();
        res.status(201).json({ message: '訂位成功' });
    } catch (error) {
        res.status(500).json({ message: '訂位失敗，請稍後再試。', error: error.message });
    }
});

// 密碼保護頁面
app.post('/protected-views', (req, res) => {
    const { password } = req.body;
    if (password === '83094123') {
        req.session.passwordCorrect = true; // 設定 session
        res.redirect('/view'); // 轉向受保護的查看訂位頁面
    } else {
        res.status(401).send('密碼錯誤');
    }
});

app.get('/view', async (req, res) => {
    // 檢查 session 是否存在
    if (!req.session.passwordCorrect) {
        return res.status(403).send('未經授權，請先輸入密碼');
    }

    try {
        const reservations = await Reservation.find();
        res.render('reservations', { reservations });
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ message: '無法載入訂位資料' });
    }
});

const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour);
    const suffix = hourInt >= 12 ? '下午' : '上午';
    const formattedHour = hourInt % 12 || 12; // 12小時制
    return `${formattedHour}:${minute} ${suffix}`;
};

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
