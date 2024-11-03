import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/api/index.js

import axios from '../axiosConfig';

export const refreshToken = async (refreshToken) => {
  const response = await axios.post('/auth/refresh-token', {
    token: refreshToken,
  });
  return response.data;
};
