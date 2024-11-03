// createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // 確保路徑正確
const { MONGO_URI, JWT_SECRET } = require('./config'); // 確保路徑正確

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('已連接到 MongoDB');

    // 檢查是否已經存在管理員用戶
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('管理員用戶已存在，跳過創建。');
      process.exit(0);
    }

    // 創建管理員用戶
    const hashedPassword = await bcrypt.hash('adminpassword123', 10); // 替換為你想要的密碼
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com', // 替換為你的管理員電子郵件
      password: 3200,
      role: 'admin',
    });

    await adminUser.save();
    console.log('管理員用戶已成功創建。');

    process.exit(0);
  } catch (error) {
    console.error('創建管理員用戶失敗：', error);
    process.exit(1);
  }
};

createAdmin();