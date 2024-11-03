// backend-project/scripts/add-logs.js

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // 定义需要添加日志的导出函数名称
  const targetFunctions = [
    'login',
    'register',
    'logout',
    'authorizeRoles',
    'registerCustomer',
    'registerRestaurant',
    'registerDeliveryPerson',
    'registerAdmin',
    'refreshTokenController',
    'verifyToken',
    'getDeliveryPersonProfile',
    'getAllDeliveryPersons',
    'getDeliveryPersonById',
    'updateDeliveryPerson',
    'disableDeliveryPerson',
    'enableDeliveryPerson',
    'getAllDeliveryPersonsLocations',
    'getDeliveryPersonLocation',
    'getOrderHistory',
    'getCurrentOrders',
    'getStatus',
    'updateStatus',
    'getPendingOrders',
    'acceptOrder',
    'getEarnings',
    'updateLocation',
    'getPopularDishes',
    'getMockPopularDishes',
    'addDish',
    'getDishById',
    'updateDish',
    'deleteDish',
    'handleGeocode',
    'getNotifications',
    'createNotification',
    'createOrder',
    'getAllOrders',
    'getOrderById',
    'updateOrderStatus',
    'deleteOrder',
    'generateSystemReport',
    'generateUserBehaviorReport',
    'generateRestaurantPerformanceReport',
    'exportReport',
    'getPopularRestaurants',
    'getNearbyRestaurants',
    'getRestaurantMenu',
    'getAllRestaurants',
    'addRestaurant',
    'updateRestaurant',
    'disableRestaurant',
    'getRestaurantPerformance',
    'getRestaurantProfile',
    'getSalesData',
    'getEmployees',
    'getCurrentRestaurantProfile',
    'registerUser',
    'loginUser',
    'getUserProfile',
    'updateUserProfile',
    'getAllUsers',
    'deleteUser',
    'updateUserRole',
    // 添加更多需要添加日志的函数名
  ];

  const log = (message) => {
    console.log(`[add-logs] ${message}`);
  };

  let functionsUpdated = false;

  /**
   * 检查是否存在特定的 console.log 语句
   * @param {Array} body - 函数体的语句数组
   * @param {string} message - 要检查的日志消息
   * @param {string} method - 'log' 或 'error'
   * @returns {boolean}
   */
  function hasConsoleLog(body, message, method = 'log') {
    if (!body || !Array.isArray(body)) {
      return false;
    }

    return body.some(statement => {
      return (
        statement.type === 'ExpressionStatement' &&
        statement.expression.type === 'CallExpression' &&
        statement.expression.callee.type === 'MemberExpression' &&
        statement.expression.callee.object.name === 'console' &&
        statement.expression.callee.property.name === method &&
        statement.expression.arguments.length > 0 &&
        statement.expression.arguments[0].type === 'Literal' &&
        statement.expression.arguments[0].value === message
      );
    });
  }

  /**
   * 为函数添加入口、返回和错误日志
   * @param {string} funcName - 函数名称
   * @param {NodePath} funcPath - 函数路径
   */
  function addLogsToFunction(funcName, funcPath) {
    try {
      const func = funcPath.node;

      // 确保函数体是一个 BlockStatement
      if (func.body.type !== 'BlockStatement') {
        // 将简洁体箭头函数转换为块语句
        func.body = j.blockStatement([
          j.returnStatement(func.body)
        ]);
        log(`Converted concise body to block statement for function: ${funcName}`);
        functionsUpdated = true;
      }

      const body = func.body.body;

      // 确保 body 是一个有效的数组
      if (!body || !Array.isArray(body)) {
        log(`Skipping function: ${funcName} due to invalid function body.`);
        return;
      }

      // 添加入口日志
      const paramNames = func.params.map(param => param.name || 'param').join(', ');
      const entryLogMessage = `Entering ${funcName} with parameters: ${paramNames}`;
      if (!hasConsoleLog(body, entryLogMessage, 'log')) {
        const entryLog = j.expressionStatement(
          j.callExpression(
            j.memberExpression(j.identifier('console'), j.identifier('log')),
            [j.literal(entryLogMessage)]
          )
        );
        body.unshift(entryLog);
        log(`Added entry log to function: ${funcName}`);
        functionsUpdated = true;
      } else {
        log(`Entry log already exists in function: ${funcName}`);
      }

      // 添加错误日志（仅当函数包含 try-catch 块时）
      j(func.body).find(j.CatchClause).forEach(catchPath => {
        const param = catchPath.node.param ? catchPath.node.param.name : 'error';
        const errorLogMessage = `Error in ${funcName}:`;
        const catchBody = catchPath.node.body.body;

        if (!hasConsoleLog(catchBody, errorLogMessage, 'error')) {
          const errorLog = j.expressionStatement(
            j.callExpression(
              j.memberExpression(j.identifier('console'), j.identifier('error')),
              [j.literal(errorLogMessage), j.identifier(param)]
            )
          );
          catchPath.node.body.body.unshift(errorLog);
          log(`Added error log to function: ${funcName}`);
          functionsUpdated = true;
        } else {
          log(`Error log already exists in function: ${funcName}`);
        }
      });

    } catch (error) {
      console.error(`[add-logs] Error processing function ${funcName}:`, error);
    }
  }

  // 处理 exports.functionName = function() { ... }
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'exports' },
      property: { type: 'Identifier' },
    },
    right: {
      type: 'FunctionExpression',
    },
  }).forEach(pathNode => {
    const funcName = pathNode.node.left.property.name;
    log(`Found exports.${funcName} as FunctionExpression`);
    if (targetFunctions.includes(funcName)) {
      log(`Processing exported function: ${funcName}`);
      addLogsToFunction(funcName, pathNode.get('right'));
    } else {
      log(`Function ${funcName} is not in targetFunctions, skipping.`);
    }
  });

  // 处理 module.exports = { functionName: function() { ... }, ... }
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'module' },
      property: { name: 'exports' },
    },
    right: {
      type: 'ObjectExpression',
    },
  }).forEach(pathNode => {
    log(`Found module.exports as ObjectExpression`);
    const properties = pathNode.node.right.properties;
    properties.forEach((prop, index) => {
      if (prop.key.type === 'Identifier' && targetFunctions.includes(prop.key.name)) {
        const funcName = prop.key.name;
        log(`Processing module.exports.${funcName}`);
        if (prop.value.type === 'FunctionExpression' || prop.value.type === 'ArrowFunctionExpression') {
          addLogsToFunction(funcName, pathNode.get('right', 'properties', index, 'value'));
        }
      } else {
        if (prop.key.type !== 'Identifier') {
          log(`Skipping non-Identifier export property: ${prop.key.type}`);
        } else {
          log(`Function ${prop.key.name} is not in targetFunctions, skipping.`);
        }
      }
    });
  });

  // 处理 exports.functionName = () => { ... }
  root.find(j.AssignmentExpression, {
    left: {
      object: { name: 'exports' },
      property: { type: 'Identifier' },
    },
    right: {
      type: 'ArrowFunctionExpression',
    },
  }).forEach(pathNode => {
    const funcName = pathNode.node.left.property.name;
    log(`Found exports.${funcName} as ArrowFunctionExpression`);
    if (targetFunctions.includes(funcName)) {
      log(`Processing exported arrow function: ${funcName}`);
      addLogsToFunction(funcName, pathNode.get('right'));
    } else {
      log(`Function ${funcName} is not in targetFunctions, skipping.`);
    }
  });

  if (functionsUpdated) {
    log(`File ${fileInfo.path} was modified.`);
    return root.toSource();
  } else {
    log(`No target functions found or already modified in ${fileInfo.path}.`);
    return null;
  }
};