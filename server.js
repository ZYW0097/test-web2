const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); // 引入 express-session
require('dotenv').config();

const connectToDatabase = require('./database');
const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 設定 session
app.use(session({
    secret: 'your-secret-key', // 替換為您的秘密金鑰
    resave: false,
    saveUninitialized: true,
}));

// 連接到 MongoDB
connectToDatabase();

// 訂位模型
const reservationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    highChair: { type: Number, default: 0 },
});

const Reservation = mongoose.model('Reservation', reservationSchema, 'bookings');

// 主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 訂位表單提交
app.post('/reservations', async (req, res) => {
    const { name, phone, date, time, adults, children, highChair } = req.body;

    // 驗證電話格式
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: '電話格式不正確，請使用台灣手機格式' });
    }

    // 檢查日期是否為今天以前
    const today = new Date();
    if (new Date(date) < today) {
        return res.status(400).json({ message: '日期不能選擇今天以前' });
    }

    // 檢查兒童椅數量
    if (children > 0 && highChair > children) {
        return res.status(400).json({ message: '兒童椅數量不能大於小孩數量' });
    }

    try {
        const reservation = new Reservation({ name, phone, date, time, adults, children, highChair });
        await reservation.save();
        res.status(201).json({ message: '訂位成功' });
    } catch (error) {
        res.status(400).json({ message: error.message });
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

// 格式化時間的函數
const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const hourInt = parseInt(hour);
    const suffix = hourInt >= 12 ? '下午' : '上午';
    const formattedHour = hourInt % 12 || 12; // 12小時制
    return `${formattedHour}:${minute} ${suffix}`;
};

// 查看訂位頁面
app.get('/view', async (req, res) => {
    // 檢查 session 是否存在
    if (!req.session.passwordCorrect) {
        return res.status(403).send('未經授權，請先輸入密碼');
    }

    try {
        const reservations = await Reservation.find();
        // 將 formatTime 函數傳遞給 EJS
        res.render('reservations', { reservations, formatTime }); 
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ message: '無法載入訂位資料' });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
