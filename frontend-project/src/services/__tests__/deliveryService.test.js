import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/services/__tests__/deliveryService.test.js

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getCurrentOrders } from '@services/deliveryService';
import axiosInstance from '@utils/axiosInstance';

const mock = new MockAdapter(axiosInstance);

describe('deliveryService', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('getCurrentOrders', () => {
    it('should fetch current orders successfully', async () => {
      const mockData = [{ id: 'order1' }, { id: 'order2' }];
      mock.onGet('/delivery-person/orders/current').reply(200, mockData);

      const data = await getCurrentOrders();
      expect(data).toEqual(mockData);
    });

    it('should handle error when fetching current orders fails', async () => {
      mock.onGet('/delivery-person/orders/current').reply(500);

      await expect(getCurrentOrders()).rejects.toThrow('獲取當前訂單失敗');
    });

    it('should handle request cancellation', async () => {
      mock.onGet('/delivery-person/orders/current').reply(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve([200, [{ id: 'order1' }]]);
          }, 1000);
        });
      });

      const controller = new AbortController();
      const promise = getCurrentOrders(controller.signal);
      controller.abort();

      await expect(promise).resolves.toBeUndefined();
    });
  });

  // 添加更多測試用例
});
