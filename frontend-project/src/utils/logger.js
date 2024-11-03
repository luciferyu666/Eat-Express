import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/utils/logger.js

const logger = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
};

export default logger;
