// backend-project/scripts/dataSeeder/dataSeeder.js

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const chalk = require('chalk');

// 导入模型
const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const Dish = require('../../models/Dish');
const Order = require('../../models/Order');

// 根据 NODE_ENV 加载环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = `.env.${NODE_ENV}`;
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

// 验证必要的环境变量
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_MAPS_API_KEY'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(chalk.red(`[ERROR] 缺少必要的环境变量: ${varName}`));
    process.exit(1);
  }
});

// 记录配置信息（隐藏敏感信息）
if (NODE_ENV !== 'production') {
  console.log(chalk.blue('加载的配置:'));
  console.log(chalk.blue(`- MONGO_URI: ${process.env.MONGO_URI}`));
  console.log(chalk.blue(`- REDIS_URL: ${process.env.REDIS_URL || '未设置'}`));
  console.log(chalk.blue(`- FRONTEND_URL: ${process.env.FRONTEND_URL || '未设置'}`));
  console.log(chalk.blue(`- PORT: ${process.env.PORT || 5000}`));
  console.log(chalk.blue(`- NODE_ENV: ${NODE_ENV}`));
  console.log(chalk.blue('- JWT_SECRET: [已隐藏]'));
  console.log(chalk.blue('- GOOGLE_MAPS_API_KEY: [已隐藏]'));
}

// 设置盐的轮数
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 12;

// 防止在生产环境中运行
if (NODE_ENV === 'production') {
  console.log(chalk.red('❌ 数据种子脚本在生产环境中已禁用。'));
  process.exit(0);
}

// 连接到 MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log(chalk.green('✅ 成功连接到 MongoDB'));

    // 开始事务会话
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 同步索引
      await User.syncIndexes({ session });
      await Restaurant.syncIndexes({ session });
      await Dish.syncIndexes({ session });
      await Order.syncIndexes({ session });
      console.log(chalk.green('✅ 索引已同步'));

      // 种子数据
      const createdUsers = await createUsers(session);
      const createdRestaurants = await createRestaurants(session, createdUsers);
      const createdDishes = await createDishes(session, createdRestaurants);
      const createdOrders = await createOrders(session, createdUsers, createdRestaurants, createdDishes);

      // 提交事务
      await session.commitTransaction();
      console.log(chalk.green('✅ 数据库种子已成功完成'));
    } catch (error) {
      // 发生错误时中止事务
      await session.abortTransaction();
      console.error(chalk.red('❌ 数据库种子失败:', error));
    } finally {
      session.endSession();
      mongoose.connection.close();
      console.log(chalk.yellow('🔒 MongoDB 连接已关闭'));
      process.exit(0);
    }
  })
  .catch(err => {
    console.error(chalk.red('❌ 连接到 MongoDB 失败:', err));
    process.exit(1);
  });

// 创建用户的函数，带有重复检查
const createUsers = async (session) => {
  console.log(chalk.blue('🔄 正在添加用户...'));

  // 定义用户
  const users = [
    // 管理员
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      username: 'admin',
    },
    // 配送员一
    {
      name: '配送员一',
      email: 'delivery1@example.com',
      password: 'password123',
      role: 'delivery_person',
      phone: '+8612345678901',
      vehicleType: 'bike',
      status: 'available',
      deliveryRadius: 10,
      optimizedRoute: [],
      totalDistance: 0,
      currentOrderCount: 0,
      currentOrders: [],
      currentLocation: {
        type: 'Point',
        coordinates: [121.497658, 25.131104],
      },
      username: 'delivery_person1',
    },
    // 配送员二
    {
      name: '配送员二',
      email: 'delivery2@example.com',
      password: 'password123',
      role: 'delivery_person',
      phone: '+8612345678902',
      vehicleType: 'car',
      status: 'busy',
      deliveryRadius: 15,
      optimizedRoute: [],
      totalDistance: 25,
      currentOrderCount: 0,
      currentOrders: [],
      currentLocation: {
        type: 'Point',
        coordinates: [121.4737, 31.2304],
      },
      username: 'delivery_person2',
    },
    // 测试用户
    {
      name: '测试用户',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+8612345678903',
      username: 'testuser',
    },
    // 餐厅老板一
    {
      name: '餐厅老板一',
      email: 'owner1@example.com',
      password: 'owner123',
      role: 'restaurant_owner',
      username: 'owner1',
      // 餐厅将在后续步骤中设置
    },
    // 餐厅老板二
    {
      name: '餐厅老板二',
      email: 'owner2@example.com',
      password: 'owner123',
      role: 'restaurant_owner',
      username: 'owner2',
      // 餐厅将在后续步骤中设置
    },
  ];

  // 遍历用户，检查是否存在，若不存在则创建
  const insertedUsers = [];
  for (const userData of users) {
    try {
      const existingUser = await User.findOne({ email: userData.email }).session(session);
      if (existingUser) {
        console.log(chalk.yellow(`⚠️ 用户已存在: ${userData.email}，跳过...`));
        insertedUsers.push(existingUser);
        continue;
      }

      // 哈希密码
      const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
      const newUser = new User({ ...userData, password: hashedPassword });

      await newUser.save({ session });
      insertedUsers.push(newUser);
      console.log(chalk.green(`✅ 创建用户: ${newUser.email}`));
    } catch (error) {
      console.error(chalk.red(`❌ 创建用户失败: ${userData.email}`), error.message);
      throw error;
    }
  }

  return insertedUsers;
};

// 创建餐厅的函数，带有重复检查
const createRestaurants = async (session, users) => {
  console.log(chalk.blue('🔄 正在添加餐厅...'));

  // 定义餐厅
  const restaurants = [
    {
      name: '美味餐厅 1',
      address: '北投区美食街1号',
      phone: '+8612345678904',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [121.497658, 25.131104],
      },
      openingHours: '09:00-21:00',
      categories: ['中餐', '快餐'],
      rating: 4.5,
      ownerEmail: 'owner1@example.com',
      sample: true,
    },
    {
      name: '美味餐厅 2',
      address: '北投区美食街2号',
      phone: '+8612345678905',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [121.496658, 25.130104],
      },
      openingHours: '10:00-22:00',
      categories: ['西餐', '意大利菜'],
      rating: 4.2,
      ownerEmail: 'owner2@example.com',
      sample: true,
    },
    {
      name: '美味餐厅 3',
      address: '北投区美食街3号',
      phone: '+8612345678906',
      status: 'active',
      location: {
        type: 'Point',
        coordinates: [121.498658, 25.132104],
      },
      openingHours: '08:00-20:00',
      categories: ['日本料理', '寿司'],
      rating: 4.7,
      ownerEmail: 'owner1@example.com',
      sample: true,
    },
  ];

  const createdRestaurants = [];

  for (const restaurantData of restaurants) {
    try {
      console.log(chalk.blue(`🔍 创建餐厅: ${restaurantData.name}`));

      // 根据电子邮件查找所有者
      const owner = users.find(u => u.role === 'restaurant_owner' && u.email === restaurantData.ownerEmail);
      if (!owner) {
        throw new Error(`未找到餐厅所有者: ${restaurantData.ownerEmail}`);
      }

      // 检查餐厅是否已存在
      const existingRestaurant = await Restaurant.findOne({ name: restaurantData.name }).session(session);
      if (existingRestaurant) {
        console.log(chalk.yellow(`⚠️ 餐厅已存在: ${restaurantData.name}，跳过...`));
        createdRestaurants.push(existingRestaurant);
        continue;
      }

      // 创建餐厅
      const restaurant = new Restaurant({
        name: restaurantData.name,
        address: restaurantData.address,
        phone: restaurantData.phone,
        status: restaurantData.status,
        location: restaurantData.location,
        openingHours: restaurantData.openingHours,
        categories: restaurantData.categories,
        rating: restaurantData.rating,
        owner: owner._id,
        sample: restaurantData.sample,
        menu: [],
      });

      await restaurant.save({ session });
      createdRestaurants.push(restaurant);
      console.log(chalk.green(`✅ 创建餐厅: ${restaurant.name}`));

      // 更新所有者的餐厅引用
      owner.restaurant = restaurant._id;
      await owner.save({ session });
      console.log(chalk.green(`✅ 更新餐厅所有者: ${owner.name}`));
    } catch (error) {
      console.error(chalk.red(`❌ 创建餐厅失败: ${restaurantData.name}`), error.message);
      throw error;
    }
  }

  return createdRestaurants;
};

// 创建菜品的函数，带有重复检查
const createDishes = async (session, restaurants) => {
  console.log(chalk.blue('🔄 正在添加菜品...'));

  // 定义菜品
  const dishes = [
    // 餐厅 1 的菜品
    {
      name: '招牌开胃菜',
      description: '美味可口的招牌开胃菜',
      price: 120.00,
      imageUrl: 'http://example.com/dish1.jpg',
      restaurantName: '美味餐厅 1',
      category: '开胃菜',
      isAvailable: true,
      tags: ['招牌', '开胃菜'],
    },
    {
      name: '特色主菜',
      description: '美味可口的特色主菜',
      price: 250.00,
      imageUrl: 'http://example.com/dish2.jpg',
      restaurantName: '美味餐厅 1',
      category: '主菜',
      isAvailable: true,
      tags: ['特色', '主菜'],
    },
    // 餐厅 2 的菜品
    {
      name: '经典意大利面',
      description: '传统意大利面配肉酱',
      price: 180.00,
      imageUrl: 'http://example.com/dish3.jpg',
      restaurantName: '美味餐厅 2',
      category: '主菜',
      isAvailable: true,
      tags: ['意大利面', '肉酱'],
    },
    {
      name: '玛格丽特披萨',
      description: '经典披萨，配以番茄、莫扎瑞拉和罗勒',
      price: 220.00,
      imageUrl: 'http://example.com/dish4.jpg',
      restaurantName: '美味餐厅 2',
      category: '主菜',
      isAvailable: true,
      tags: ['披萨', '莫扎瑞拉'],
    },
    // 餐厅 3 的菜品
    {
      name: '寿司拼盘',
      description: '各式新鲜寿司拼盘',
      price: 300.00,
      imageUrl: 'http://example.com/dish5.jpg',
      restaurantName: '美味餐厅 3',
      category: '主菜',
      isAvailable: true,
      tags: ['海鲜', '寿司'],
    },
    {
      name: '天妇罗',
      description: '酥脆炸蔬菜天妇罗',
      price: 150.00,
      imageUrl: 'http://example.com/dish6.jpg',
      restaurantName: '美味餐厅 3',
      category: '开胃菜',
      isAvailable: true,
      tags: ['炸物', '蔬菜'],
    },
    // 根据需要添加更多菜品
  ];

  const createdDishes = [];

  for (const dishData of dishes) {
    try {
      console.log(chalk.blue(`🔍 创建菜品: ${dishData.name}, 价格: ${dishData.price}`));

      // 根据餐厅名称查找餐厅
      const restaurant = restaurants.find(r => r.name === dishData.restaurantName);
      if (!restaurant) {
        throw new Error(`未找到餐厅: ${dishData.restaurantName}`);
      }

      // 检查菜品是否已存在
      const existingDish = await Dish.findOne({ name: dishData.name, restaurant: restaurant._id }).session(session);
      if (existingDish) {
        console.log(chalk.yellow(`⚠️ 菜品已存在: ${dishData.name} 在 ${restaurant.name}，跳过...`));
        createdDishes.push(existingDish);
        continue;
      }

      // 确保价格有两位小数
      const price = parseFloat(dishData.price.toFixed(2));

      // 创建菜品
      const dish = new Dish({
        name: dishData.name,
        description: dishData.description,
        price: price,
        imageUrl: dishData.imageUrl,
        restaurant: restaurant._id,
        category: dishData.category,
        isAvailable: dishData.isAvailable,
        tags: dishData.tags,
      });

      await dish.save({ session });
      createdDishes.push(dish);
      console.log(chalk.green(`✅ 创建菜品: ${dish.name}`));
    } catch (error) {
      console.error(chalk.red(`❌ 创建菜品失败: ${dishData.name}`), error.message);
      throw error;
    }
  }

  // 将菜品关联到餐厅的菜单中
  for (const restaurant of restaurants) {
    try {
      const restaurantDishes = createdDishes.filter(dish => dish.restaurant.toString() === restaurant._id.toString());
      if (restaurantDishes.length > 0) {
        restaurant.menu = restaurantDishes.map(dish => dish._id);
        await restaurant.save({ session });
        console.log(chalk.green(`✅ 添加 ${restaurantDishes.length} 个菜品到餐厅: ${restaurant.name}`));
      }
    } catch (error) {
      console.error(chalk.red(`❌ 将菜品关联到餐厅失败: ${restaurant.name}`), error.message);
      throw error;
    }
  }

  return createdDishes;
};

// 创建订单的函数，带有重复检查和动态总价计算
const createOrders = async (session, users, restaurants, dishes) => {
  console.log(chalk.blue('🔄 正在添加订单...'));

  // 定义订单
  const orders = [
    {
      customerEmail: 'testuser@example.com',
      restaurantName: '美味餐厅 1',
      items: [
        {
          dishName: '招牌开胃菜',
          quantity: 2,
        },
        {
          dishName: '特色主菜',
          quantity: 1,
        },
      ],
      deliveryAddress: '客户地址 1',
      customerLocation: {
        type: 'Point',
        coordinates: [121.498658, 25.132104],
      },
      paymentMethod: 'credit_card',
      status: 'completed',
      deliveryPersonEmail: 'delivery1@example.com',
      deliveryLocation: {
        type: 'Point',
        coordinates: [121.497658, 25.131104],
      },
      notes: '请快点送达，谢谢！',
    },
    {
      customerEmail: 'testuser@example.com',
      restaurantName: '美味餐厅 2',
      items: [
        {
          dishName: '经典意大利面',
          quantity: 1,
        },
        {
          dishName: '玛格丽特披萨',
          quantity: 2,
        },
      ],
      deliveryAddress: '客户地址 2',
      customerLocation: {
        type: 'Point',
        coordinates: [121.499658, 25.133104],
      },
      paymentMethod: 'online_payment',
      status: 'delivering',
      deliveryPersonEmail: 'delivery2@example.com',
      deliveryLocation: {
        type: 'Point',
        coordinates: [121.496658, 25.130104],
      },
      notes: '不要辣，谢谢！',
    },
    {
      customerEmail: 'testuser@example.com',
      restaurantName: '美味餐厅 3',
      items: [
        {
          dishName: '寿司拼盘',
          quantity: 1,
        },
        {
          dishName: '天妇罗',
          quantity: 3,
        },
      ],
      deliveryAddress: '客户地址 3',
      customerLocation: {
        type: 'Point',
        coordinates: [121.500658, 25.134104],
      },
      paymentMethod: 'cash',
      status: 'assigned',
      deliveryPersonEmail: 'delivery1@example.com',
      deliveryLocation: {
        type: 'Point',
        coordinates: [121.497658, 25.131104],
      },
      notes: '保持食物温热，谢谢！',
    },
    // 根据需要添加更多订单
  ];

  const createdOrders = [];

  for (const orderData of orders) {
    try {
      console.log(chalk.blue(`🔍 创建订单，客户: ${orderData.customerEmail}`));

      // 查找客户
      const customer = users.find(u => u.role === 'customer' && u.email === orderData.customerEmail);
      if (!customer) {
        throw new Error(`未找到客户: ${orderData.customerEmail}`);
      }

      // 查找餐厅
      const restaurant = restaurants.find(r => r.name === orderData.restaurantName);
      if (!restaurant) {
        throw new Error(`未找到餐厅: ${orderData.restaurantName}`);
      }

      // 查找配送员
      const deliveryPerson = users.find(u => u.role === 'delivery_person' && u.email === orderData.deliveryPersonEmail);
      if (!deliveryPerson) {
        throw new Error(`未找到配送员: ${orderData.deliveryPersonEmail}`);
      }

      // 查找菜品
      const orderItems = [];
      for (const item of orderData.items) {
        const dish = dishes.find(d => d.name === item.dishName && d.restaurant.toString() === restaurant._id.toString());
        if (!dish) {
          throw new Error(`未找到菜品: ${item.dishName} 在餐厅: ${restaurant.name}`);
        }
        orderItems.push({
          dish: dish._id,
          quantity: item.quantity,
          price: dish.price, // 用于总价计算
        });
      }

      // 动态计算总价
      const calculatedTotalPrice = orderItems.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);

      // 创建订单
      const order = new Order({
        customer: customer._id,
        restaurant: restaurant._id,
        items: orderItems.map(({ price, ...rest }) => rest), // 从 items 中移除 price
        deliveryAddress: orderData.deliveryAddress,
        customerLocation: orderData.customerLocation,
        restaurantAddress: restaurant.address,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        deliveryPerson: deliveryPerson._id,
        deliveryLocation: orderData.deliveryLocation,
        totalPrice: calculatedTotalPrice,
        notes: orderData.notes,
      });

      await order.save({ session });
      createdOrders.push(order);
      console.log(chalk.green(`✅ 创建订单 ID: ${order._id}, 状态: ${order.status}`));

      // 更新配送员的 currentOrders 和 currentOrderCount
      deliveryPerson.currentOrders.push(order._id);
      deliveryPerson.currentOrderCount += 1;
      await deliveryPerson.save({ session });
      console.log(chalk.green(`✅ 更新配送员: ${deliveryPerson.name} 的订单信息`));
    } catch (error) {
      console.error(chalk.red(`❌ 创建订单失败，客户: ${orderData.customerEmail}`), error.message);
      throw error;
    }
  }

  return createdOrders;
};

module.exports = {
  createUsers,
  createRestaurants,
  createDishes,
  createOrders,
};
