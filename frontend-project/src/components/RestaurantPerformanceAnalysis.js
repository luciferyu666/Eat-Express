 // src/components/RestaurantPerformanceAnalysis.js

 import React, { useEffect, useState } from 'react';
 import axios from 'axios';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

 const RestaurantPerformanceAnalysis = () => {
   const [restaurantData, setRestaurantData] = useState([]);

   useEffect(() => {
     // 从后端获取餐厅表现数据
     const fetchRestaurantData = async () => {
       try {
         const response = await axios.get('/api/reports/restaurant-performance');
         setRestaurantData(response.data);
       } catch (error) {
         console.error('获取餐厅表现数据失败', error);
       }
     };

     fetchRestaurantData();
   }, []);

   return (
     <div className="restaurant-performance-analysis mb-4">
       <h3 className="text-xl font-semibold mb-2">餐厅表现分析</h3>
       <ResponsiveContainer width="100%" height={300}>
         <BarChart data={restaurantData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
           <XAxis dataKey="restaurantName" />
           <YAxis />
           <CartesianGrid strokeDasharray="3 3" />
           <Tooltip />
           <Bar dataKey="totalOrders" name="订单量" fill="#8884d8" />
           <Bar dataKey="totalRevenue" name="总收入" fill="#82ca9d" />
         </BarChart>
       </ResponsiveContainer>
     </div>
   );
 };

 export default RestaurantPerformanceAnalysis;