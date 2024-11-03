// backend-project/tests/orderUtils.test.js

const { processOrder, hasOrderAccess } = require('../utils/orderUtils');
const { UserRole } = require('../utils/constants');

describe('orderUtils', () => {
  describe('processOrder', () => {
    it('should process valid order successfully', () => {
      const order = {
        customer: 'customer123',
        deliveryPerson: 'delivery456',
        items: [
          { productId: 'prod1', quantity: 2 },
          { productId: 'prod2', quantity: 1 },
        ],
        totalPrice: 59.99,
        status: 'pending',
      };

      const processedOrder = processOrder(order);
      expect(processedOrder).toEqual(order);
    });

    it('should throw error for invalid order data', () => {
      const invalidOrder = {
        customer: 'customer123',
        // deliveryPerson missing
        items: 'not-an-array',
        totalPrice: 'fifty-nine',
        status: 'unknown',
      };

      expect(() => processOrder(invalidOrder)).toThrow('Invalid order data: "deliveryPerson" is required');
    });
  });

  describe('hasOrderAccess', () => {
    const order = {
      customer: 'customer123',
      deliveryPerson: 'delivery456',
      _id: 'order789',
    };

    it('should allow customer to access their own order', () => {
      const user = {
        userId: 'customer123',
        role: UserRole.CUSTOMER,
        email: 'customer@example.com',
        name: 'Customer One',
      };

      expect(hasOrderAccess(user, order)).toBe(true);
    });

    it('should allow delivery person to access their assigned order', () => {
      const user = {
        userId: 'delivery456',
        role: UserRole.DELIVERY_PERSON,
        email: 'delivery@example.com',
        name: 'Delivery Person',
      };

      expect(hasOrderAccess(user, order)).toBe(true);
    });

    it('should allow admin to access any order', () => {
      const user = {
        userId: 'admin001',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
        name: 'Admin User',
      };

      expect(hasOrderAccess(user, order)).toBe(true);
    });

    it('should deny access if customer tries to access someone else\'s order', () => {
      const user = {
        userId: 'customer999',
        role: UserRole.CUSTOMER,
        email: 'othercustomer@example.com',
        name: 'Other Customer',
      };

      expect(hasOrderAccess(user, order)).toBe(false);
    });

    it('should deny access if delivery person tries to access someone else\'s order', () => {
      const user = {
        userId: 'delivery999',
        role: UserRole.DELIVERY_PERSON,
        email: 'otherdelivery@example.com',
        name: 'Other Delivery Person',
      };

      expect(hasOrderAccess(user, order)).toBe(false);
    });

    it('should throw error for invalid user data', () => {
      const invalidUser = {
        userId: 'user123',
        // role missing
        email: 'user@example.com',
        name: 'User',
      };

      expect(() => hasOrderAccess(invalidUser, order)).toThrow('Invalid user data: "role" is required');
    });

    it('should throw error for invalid order data', () => {
      const user = {
        userId: 'admin001',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
        name: 'Admin User',
      };

      const invalidOrder = {
        // customer missing
        deliveryPerson: 'delivery456',
        _id: 'order789',
      };

      expect(() => hasOrderAccess(user, invalidOrder)).toThrow('Invalid order data: "customer" is required');
    });
  });
});