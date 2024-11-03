  // backend-project/types/modules.d.js

  declare module './models/Order' {
    import { Document, Model } from 'mongoose';

    interface IOrder extends Document {
      // 定义订单字段
      customer: any;
      deliveryPerson?: any;
      restaurant: any;
      dishes: any[];
      status: 'pending' | 'accepted' | 'delivered' | 'cancelled';
      totalAmount: number;
      // 其他字段...
    }

    const Order: Model<IOrder>;
    export default Order;
  }

  declare module './models/Restaurant' {
    import { Document, Model } from 'mongoose';

    interface IRestaurant extends Document {
      // 定义餐厅字段
      name: string;
      address: string;
      // 其他字段...
    }

    const Restaurant: Model<IRestaurant>;
    export default Restaurant;
  }

  // 为其他缺少声明的模块重复上述过程