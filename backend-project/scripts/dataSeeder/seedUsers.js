// backend-project/scripts/dataSeeder/seedUsers.js

const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const ROLES = require('../../constants/roles'); // 確保路徑正確

const seedUsers = async (session) => {
  const users = [
    {
      name: 'Delivery Person 1',
      email: 'delivery1@example.com',
      password: await bcrypt.hash('password1', 12),
      role: ROLES.DELIVERY_PERSON,
      username: 'delivery1',
      availability: true,
      currentOrderCount: 0,
      currentOrders: [],
      currentLocation: {
        type: 'Point',
        coordinates: [121.4737, 31.2304], // 示例經緯度
      },
      phone: '+1234567890',
      vehicleType: 'motorbike',
      status: 'available',
      deliveryRadius: 10, // 確保提供
      optimizedRoute: [], // 或具體數據
      totalDistance: 0,
    },
    // 添加更多用戶...
  ];

  // 插入用戶
  await User.insertMany(users, { session });
  console.log('✅ 用戶數據已插入');
};

module.exports = seedUsers;