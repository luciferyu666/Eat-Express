// seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Restaurant = require('./models/Restaurant');
const Dish = require('./models/Dish');
const Order = require('./models/Order');
const DeliveryPerson = require('./models/DeliveryPerson');
const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');
const { MONGO_URI } = require('./config'); // 確保您有配置文件

const seedDatabase = async () => {
  try {
    // 連接到 MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB for seeding.');

    // 清除現有數據
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
    await Order.deleteMany({});
    await DeliveryPerson.deleteMany({});
    await Notification.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data.');

    // 創建餐廳
    const restaurants = await Restaurant.insertMany([
      {
        name: '美味餐廳 1',
        address: '北投區美食街1號',
        phone: '02-1234-5671',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [121.497658, 25.131104],
        },
      },
      {
        name: '美味餐廳 2',
        address: '北投區美食街2號',
        phone: '02-1234-5672',
        status: 'active',
        location: {
          type: 'Point',
          coordinates: [121.496658, 25.130104],
        },
      },
      // 添加更多餐廳...
    ]);
    console.log('Created Restaurants.');

    // 創建菜品
    const dishes = await Dish.insertMany([
      {
        name: '招牌菜 1',
        description: '美味可口的招牌菜 1',
        price: 200,
        imageUrl: 'http://example.com/dish1.jpg',
        categoryId: null, // 如果有分類，請填寫
        status: 'available',
      },
      {
        name: '招牌菜 2',
        description: '美味可口的招牌菜 2',
        price: 250,
        imageUrl: 'http://example.com/dish2.jpg',
        categoryId: null, // 如果有分類，請填寫
        status: 'available',
      },
      // 添加更多菜品...
    ]);
    console.log('Created Dishes.');

    // 將菜品添加到餐廳菜單
    for (const restaurant of restaurants) {
      restaurant.menu = dishes.filter(dish => dish.name.includes(restaurant.name.split(' ')[1])).map(dish => dish._id);
      await restaurant.save();
    }
    console.log('Assigned Dishes to Restaurants.');

    // 創建用戶（餐廳管理員和客戶）
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      {
        username: 'Manager1',
        email: 'manager1@example.com',
        password: hashedPassword,
        role: 'restaurant',
        address: '北投區美食街1號',
        contact: '02-1234-5671',
      },
      {
        username: 'Manager2',
        email: 'manager2@example.com',
        password: hashedPassword,
        role: 'restaurant',
        address: '北投區美食街2號',
        contact: '02-1234-5672',
      },
      {
        username: 'Customer1',
        email: 'customer1@example.com',
        password: hashedPassword,
        role: 'customer',
        address: '台北市中山區',
        contact: '0912-345-678',
      },
      // 添加更多用戶...
    ]);
    console.log('Created Users.');

    // 創建員工
    const employees = await Employee.insertMany([
      {
        name: '員工 1',
        email: 'employee1@example.com',
        role: 'Staff',
        restaurant: restaurants[0]._id,
      },
      {
        name: '員工 2',
        email: 'employee2@example.com',
        role: 'Manager',
        restaurant: restaurants[0]._id,
      },
      {
        name: '員工 3',
        email: 'employee3@example.com',
        role: 'Staff',
        restaurant: restaurants[1]._id,
      },
      // 添加更多員工...
    ]);
    console.log('Created Employees.');

    // 創建外送員
    const deliveryPersons = await DeliveryPerson.insertMany([
      {
        name: '外送員 1',
        email: 'delivery1@example.com',
        phone: '0987-654-321',
        location: {
          type: 'Point',
          coordinates: [121.498658, 25.132104],
        },
      },
      {
        name: '外送員 2',
        email: 'delivery2@example.com',
        phone: '0987-654-322',
        location: {
          type: 'Point',
          coordinates: [121.499658, 25.133104],
        },
      },
      // 添加更多外送員...
    ]);
    console.log('Created Delivery Persons.');

    // 創建訂單
    const orders = await Order.insertMany([
      {
        userId: users.find(user => user.role === 'customer')._id,
        restaurant: restaurants[0]._id,
        status: 'active',
        items: [
          { dish: dishes[0]._id, quantity: 2, notes: '無辣' },
          { dish: dishes[1]._id, quantity: 1, notes: '少鹽' },
        ],
        paymentMethod: 'credit_card',
        restaurantAddress: restaurants[0].address,
        customerLng: 121.497658 + 0.001,
        customerLat: 25.131104 + 0.001,
        deliveryAddress: '客戶地址 1',
      },
      {
        userId: users.find(user => user.role === 'customer')._id,
        restaurant: restaurants[1]._id,
        status: 'active',
        items: [
          { dish: dishes[2]._id, quantity: 3, notes: '多辣' },
        ],
        paymentMethod: 'paypal',
        restaurantAddress: restaurants[1].address,
        customerLng: 121.496658 + 0.002,
        customerLat: 25.130104 + 0.002,
        deliveryAddress: '客戶地址 2',
      },
      // 添加更多訂單...
    ]);
    console.log('Created Orders.');

    // 創建通知
    const notifications = await Notification.insertMany([
      {
        title: '系統維護通知',
        message: '系統將於明天凌晨 2 點至 4 點進行維護，期間將暫停服務。',
        restaurant: restaurants[0]._id,
      },
      {
        title: '新功能上線',
        message: '我們新增了菜品分類管理功能，請前往菜單管理查看。',
        restaurant: restaurants[1]._id,
      },
      // 添加更多通知...
    ]);
    console.log('Created Notifications.');

    // 創建反饋
    const feedbacks = await Feedback.insertMany([
      {
        userId: users.find(user => user.role === 'customer')._id,
        restaurantId: restaurants[0]._id,
        rating: 5,
        comment: '非常好的餐廳，食物美味，服務周到！',
      },
      {
        userId: users.find(user => user.role === 'customer')._id,
        restaurantId: restaurants[1]._id,
        rating: 4,
        comment: '菜品不錯，但等待時間稍長。',
      },
      // 添加更多反饋...
    ]);
    console.log('Created Feedbacks.');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();