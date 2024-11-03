import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/DeliveryRegister.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@utils/axiosInstance';
import Joi from 'joi';

// 可重用的表单字段组件
const FormField = ({
  label,
  id,
  name,
  type,
  value,
  onChange,
  error,
  placeholder,
  ...rest
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-700 font-semibold mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-lg focus:outline-none focus:ring-2 ${
        error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
      }`}
      placeholder={placeholder}
      aria-invalid={!!error}
      aria-describedby={`${id}-error`}
      {...rest}
    />
    {error && (
      <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

// 可重用的选择字段组件
const SelectField = ({
  label,
  id,
  name,
  value,
  onChange,
  error,
  options,
  ...rest
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-gray-700 font-semibold mb-2">
      {label}
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-lg focus:outline-none focus:ring-2 ${
        error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
      }`}
      aria-invalid={!!error}
      aria-describedby={`${id}-error`}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

function DeliveryRegister() {
  // 状态变量
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    phone: '',
    vehicleType: '',
    deliveryRadius: '',
    currentLocation: null,
  });

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    phone: '',
    vehicleType: '',
    deliveryRadius: '',
    currentLocation: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 定义表单验证 schema
  const validationSchema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.empty': '用户名不能为空',
      'string.min': '用户名至少包含3个字符',
      'string.max': '用户名最多包含30个字符',
      'any.required': '用户名是必填字段',
    }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.empty': '电子邮件不能为空',
        'string.email': '请输入有效的电子邮件地址',
        'any.required': '电子邮件是必填字段',
      }),
    password: Joi.string().min(6).required().messages({
      'string.empty': '密码不能为空',
      'string.min': '密码至少包含6个字符',
      'any.required': '密码是必填字段',
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': '姓名不能为空',
      'string.min': '姓名至少包含2个字符',
      'string.max': '姓名最多包含50个字符',
      'any.required': '姓名是必填字段',
    }),
    phone: Joi.string()
      .pattern(/^[0-9+\-\s()]{7,}$/)
      .required()
      .messages({
        'string.empty': '电话号码不能为空',
        'string.pattern.base': '请输入有效的电话号码',
        'any.required': '电话号码是必填字段',
      }),
    vehicleType: Joi.string()
      .valid('bike', 'motorbike', 'car', 'scooter')
      .required()
      .messages({
        'any.only': '请选择有效的交通工具类型',
        'any.required': '交通工具类型是必填字段',
      }),
    deliveryRadius: Joi.number().positive().required().messages({
      'number.base': '配送半径必须为数字',
      'number.positive': '配送半径必须为正数',
      'any.required': '配送半径是必填字段',
    }),
    currentLocation: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array()
        .length(2)
        .items(Joi.number().required())
        .required(),
    })
      .optional()
      .messages({
        'object.base': '当前位置格式不正确',
      }),
  });

  // 获取当前位置
  useEffect(() => {
    if (navigator.geolocation) {
      // 提示用户正在获取地理位置
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        currentLocation: '正在获取您的当前位置，请允许浏览器访问您的位置信息。',
      }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // 转换为 GeoJSON 格式
          setFormData((prevData) => ({
            ...prevData,
            currentLocation: {
              type: 'Point',
              coordinates: [longitude, latitude], // 注意顺序：经度在前
            },
          }));
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            currentLocation: '',
          }));
        },
        (error) => {
          console.error('无法获取当前位置：', error);
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            currentLocation: '无法获取当前位置，请允许定位权限或手动输入位置。',
          }));
        }
      );
    } else {
      console.error('浏览器不支持地理定位');
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        currentLocation: '浏览器不支持地理定位，请手动输入位置。',
      }));
    }
  }, []);

  // 表单输入处理
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // 验证单个字段
    validateField(name, value);
  };

  // 表单字段验证
  const validateField = (name, value) => {
    const fieldSchema = validationSchema.extract(name);
    const { error } = fieldSchema.validate(value);

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error ? error.message : '',
    }));
  };

  // 表单提交处理
  const handleRegister = async (e) => {
    e.preventDefault();

    // 客户端验证
    const { error, value } = validationSchema.validate(formData, {
      abortEarly: false,
    });

    if (error) {
      const fieldErrors = {};
      error.details.forEach((detail) => {
        fieldErrors[detail.path[0]] = detail.message;
      });
      setFormErrors(fieldErrors);
      setErrorMessage('请输入所有必填字段并修正错误。');
      setSuccessMessage('');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 在开发环境中打印发送的数据（生产环境应移除）
      if (process.env.NODE_ENV !== 'production') {
        console.log('发送的数据:', {
          ...value,
          deliveryRadius: Number(value.deliveryRadius),
        });
      }

      // 发送注册请求
      const response = await axiosInstance.post(
        '/auth/register/delivery-person',
        {
          ...value,
          deliveryRadius: Number(value.deliveryRadius),
        }
      );

      // 从后端响应中获取 Token
      const { token, refreshToken, role } = response.data;

      // 将 Token 存储在 sessionStorage 中
      // 注意：为了安全，建议在后端使用 HTTP-only Cookies 存储令牌
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('role', role);

      // 显示成功信息并跳转到登录页面
      setSuccessMessage('注册成功！即将跳转到登录页面...');
      setErrorMessage('');
      setFormData({
        username: '',
        email: '',
        password: '',
        name: '',
        phone: '',
        vehicleType: '',
        deliveryRadius: '',
        currentLocation: null,
      });
      setFormErrors({
        username: '',
        email: '',
        password: '',
        name: '',
        phone: '',
        vehicleType: '',
        deliveryRadius: '',
        currentLocation: '',
      });

      // 立即跳转到登录页面
      navigate('/delivery/login');
    } catch (error) {
      console.error('注册失败:', error);

      let errorMsg = '注册失败，请稍后再试。';

      if (error.response) {
        if (error.response.status === 400 || error.response.status === 409) {
          errorMsg =
            '注册失败：' +
            (error.response.data.error || '请检查输入信息是否正确。');
        } else {
          errorMsg = '注册失败，请稍后再试。';
        }
      } else if (error.request) {
        errorMsg = '无法连接到服务器，请稍后再试。';
      } else {
        errorMsg = '注册失败，请检查输入资料是否正确。';
      }

      setErrorMessage(errorMsg);
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">
        外送员注册
      </h1>
      {!formData.currentLocation && (
        <p className="text-yellow-500 text-center mb-4">
          正在获取您的当前位置，请允许浏览器访问您的位置信息。
        </p>
      )}
      <form
        onSubmit={handleRegister}
        className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md"
      >
        {/* 用户名字段 */}
        <FormField
          label="用户名"
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          error={formErrors.username}
          placeholder="请输入用户名（用于登录）"
          required
        />

        {/* 姓名字段 */}
        <FormField
          label="姓名"
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          placeholder="请输入您的真实姓名"
          required
        />

        {/* 电话号码字段 */}
        <FormField
          label="电话号码"
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          error={formErrors.phone}
          placeholder="请输入您的电话号码"
          required
        />

        {/* 交通工具类型字段 */}
        <SelectField
          label="交通工具类型"
          id="vehicleType"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          error={formErrors.vehicleType}
          options={[
            { value: '', label: '请选择您的交通工具' },
            { value: 'bike', label: '自行车' },
            { value: 'motorbike', label: '摩托车' },
            { value: 'car', label: '汽车' },
            { value: 'scooter', label: '踏板车' },
          ]}
          required
        />

        {/* 配送半径字段 */}
        <FormField
          label="配送半径（公里）"
          id="deliveryRadius"
          name="deliveryRadius"
          type="number"
          value={formData.deliveryRadius}
          onChange={handleChange}
          error={formErrors.deliveryRadius}
          placeholder="请输入您的配送半径"
          min="1"
          required
        />

        {/* 电子邮件字段 */}
        <FormField
          label="电子邮件"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="请输入您的电子邮件"
          required
        />

        {/* 密码字段 */}
        <FormField
          label="密码"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          placeholder="请输入您的密码"
          required
        />

        {/* 提交按钮 */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '注册中...' : '注册'}
        </button>

        {/* 全局错误信息显示 */}
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}

        {/* 成功信息显示 */}
        {successMessage && (
          <div className="text-green-500 text-center mt-4">
            {successMessage}
            {/* 可选地添加跳转按钮 */}
            <button
              onClick={() => navigate('/delivery/login')}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
            >
              前往登录
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default DeliveryRegister;
