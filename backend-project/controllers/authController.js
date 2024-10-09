// backend-project/controllers/authController.js


const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('../utils/authHelpers');
const User = require('../models/User');
const { JWT_SECRET } = require('../config'); // 引入 JWT_SECRET


// 確保 JWT_SECRET 存在
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in configuration');
}


// 顧客註冊控制器
exports.registerCustomer = async (req, res) => {
  const { username, email, password } = req.body;


  try {
    const existingUser = await User.findOne({ email, role: 'customer' });
    if (existingUser) {
      return res.status(400).json({ error: '該電子郵件已被註冊為顧客' });
    }


    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'customer',
    });


    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '1h' } // 設置過期時間為1小時
    );


    // 添加日誌輸出以確認 JWT_SECRET 和生成的 Token
    console.log('顧客註冊成功，JWT_SECRET:', JWT_SECRET);
    console.log('顧客註冊成功，生成的 Token:', token);


    res.status(201).json({ message: '顧客註冊成功', token });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ error: '註冊失敗，請稍後再試' });
  }
};


// 餐廳註冊控制器
exports.registerRestaurant = async (req, res) => {
  const { restaurantName, email, password } = req.body;


  try {
    const existingRestaurant = await User.findOne({ email, role: 'restaurant' });
    if (existingRestaurant) {
      return res.status(400).json({ error: '該餐廳已經註冊' });
    }


    const hashedPassword = await hashPassword(password);
    const newRestaurant = new User({
      username: restaurantName,
      email,
      password: hashedPassword,
      role: 'restaurant',
    });


    await newRestaurant.save();
    const token = jwt.sign(
      { userId: newRestaurant._id, role: 'restaurant' },
      JWT_SECRET,
      { expiresIn: '1h' } // 設置過期時間為1小時
    );


    // 添加日誌輸出以確認 JWT_SECRET 和生成的 Token
    console.log('餐廳註冊成功，JWT_SECRET:', JWT_SECRET);
    console.log('餐廳註冊成功，生成的 Token:', token);


    res.status(201).json({ message: '餐廳註冊成功', token });
  } catch (error) {
    console.error('餐廳註冊錯誤:', error.message);
    res.status(500).json({ error: '註冊失敗，請稍後再試', details: error.message });
  }
};


// 外送員註冊控制器
exports.registerDeliveryPerson = async (req, res) => {
  const { deliveryPersonName, email, password } = req.body;


  try {
    const existingDeliveryPerson = await User.findOne({ email, role: 'delivery_person' });
    if (existingDeliveryPerson) {
      return res.status(400).json({ error: '該電子郵件已被註冊為外送員' });
    }


    const hashedPassword = await hashPassword(password);
    const newDeliveryPerson = new User({
      username: deliveryPersonName,
      email,
      password: hashedPassword,
      role: 'delivery_person',
    });


    await newDeliveryPerson.save();
    const token = jwt.sign(
      { userId: newDeliveryPerson._id, role: 'delivery_person' },
      JWT_SECRET,
      { expiresIn: '1h' } // 設置過期時間為1小時
    );


    // 添加日誌輸出以確認 JWT_SECRET 和生成的 Token
    console.log('外送員註冊成功，JWT_SECRET:', JWT_SECRET);
    console.log('外送員註冊成功，生成的 Token:', token);


    res.status(201).json({ message: '外送員註冊成功', token });
  } catch (error) {
    console.error('外送員註冊錯誤:', error.message);
    res.status(500).json({ error: '註冊失敗，請稍後再試', details: error.message });
  }
};


// 管理員登入控制器
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;


  try {
    const adminRecord = await User.findOne({ email, role: 'admin' });
    if (!adminRecord) {
      console.error(`登入失敗: 管理員 ${email} 不存在`);
      return res.status(400).json({ message: '管理員不存在' });
    }


    const isMatch = await verifyPassword(password, adminRecord.password);
    if (!isMatch) {
      console.error(`登入失敗: 管理員 ${email} 密碼不正確`);
      return res.status(400).json({ message: '密碼不正確' });
    }


    const token = jwt.sign(
      { userId: adminRecord._id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' } // 設置過期時間為1小時
    );


    // 添加日誌輸出以確認 JWT_SECRET 和生成的 Token
    console.log('管理員登入成功，JWT_SECRET:', JWT_SECRET);
    console.log('管理員登入成功，生成的 Token:', token);


    res.status(200).json({ token, role: adminRecord.role });
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};


// 通用登入控制器（顧客、餐廳、外送員）
exports.login = async (req, res) => {
  const { email, password } = req.body;


  try {
    const userRecord = await User.findOne({ email });
    if (!userRecord) {
      console.error(`登入失敗: 用戶 ${email} 不存在`);
      return res.status(400).json({ message: '用戶不存在' });
    }


    const isMatch = await verifyPassword(password, userRecord.password);
    if (!isMatch) {
      console.error(`登入失敗: 用戶 ${email} 密碼不正確`);
      return res.status(400).json({ message: '密碼不正確' });
    }


    const token = jwt.sign(
      { userId: userRecord._id, role: userRecord.role },
      JWT_SECRET,
      { expiresIn: '1h' } // 設置過期時間為1小時
    );


    // 添加日誌輸出以確認 JWT_SECRET 和生成的 Token
    console.log('登入成功，JWT_SECRET:', JWT_SECRET);
    console.log('登入成功，生成的 Token:', token);


    res.status(200).json({ token, role: userRecord.role });
  } catch (error) {
    console.error('登入時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};


// 登出控制器
exports.logout = (req, res) => {
  try {
    console.log('登出成功，userId:', req.userId);
    res.status(200).json({ message: '登出成功' });
  } catch (error) {
    console.error('登出錯誤:', error);
    res.status(500).json({ error: '登出失敗，請稍後再試' });
  }
};


// 驗證 JWT token 的中間件
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '授權失敗，請提供 Token' });
  }


  const token = authHeader.split(' ')[1];


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error('Token 驗證錯誤:', error);
    return res.status(401).json({ error: 'Token 無效或已過期' });
  }
};