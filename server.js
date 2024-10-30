const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// 連接到 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    mongoose.set('strictQuery', false); // 或者設為 true
    console.log('MongoDB connected');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

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

const Reservation = mongoose.model('Reservation', reservationSchema);

// 主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 訂位表單提交
app.post('/reservations', async (req, res) => {
    const { name, phone, date, time, adults, children, highChair } = req.body;

    // 驗證電話格式
    const phoneRegex = /^09\d{8}$/; // 台灣手機格式
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
        res.status(201).redirect('/view');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// 查看訂位頁面
app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

// 密碼保護頁面
app.post('/protected-view', (req, res) => {
    const { password } = req.body;
    if (password === '83094123') {
        Reservation.find()
            .then(reservations => {
                res.render('reservations', { reservations });
            })
            .catch(err => {
                res.status(500).json({ message: err.message });
            });
    } else {
        res.status(401).send('密碼錯誤');
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
