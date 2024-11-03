import { storeAuthToken } from "@utils/tokenStorage";
// src/components/RestaurantHomePage/EmployeeManagement.js

import React, { useState } from 'react';
import api from '@utils/api';

const EmployeeManagement = ({ employees }) => {
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'Staff', // 'Manager' 或 'Staff'
  });

  const handleAddEmployee = () => {
    const { name, email, role } = newEmployee;
    if (!name || !email || !role) {
      alert('請填寫所有必填項。');
      return;
    }

    api
      .post('/restaurant/employees', newEmployee)
      .then((response) => {
        alert('員工添加成功！');
        setNewEmployee({ name: '', email: '', role: 'Staff' });
      })
      .catch((error) => console.error('添加員工失敗:', error));
  };

  const handleDeleteEmployee = (employeeId) => {
    api
      .delete(`/restaurant/employees/${employeeId}`)
      .then(() => {
        alert('員工刪除成功！');
      })
      .catch((error) => console.error('刪除員工失敗:', error));
  };

  const handleRoleChange = (employeeId, newRole) => {
    api
      .put(`/restaurant/employees/${employeeId}/role`, { role: newRole })
      .then(() => {
        alert('員工角色更新成功！');
      })
      .catch((error) => console.error('更新員工角色失敗:', error));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">員工管理</h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">添加新員工</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="姓名"
            value={newEmployee.name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, name: e.target.value })
            }
            className="border rounded px-2 py-1 w-full"
          />
          <input
            type="email"
            placeholder="電子郵件"
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            className="border rounded px-2 py-1 w-full"
          />
          <select
            value={newEmployee.role}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, role: e.target.value })
            }
            className="border rounded px-2 py-1 w-full"
          >
            <option value="Manager">經理</option>
            <option value="Staff">員工</option>
          </select>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAddEmployee}
          >
            添加員工
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">現有員工</h3>
        {employees.length > 0 ? (
          <ul className="space-y-4">
            {employees.map((employee) => (
              <li
                key={employee.id}
                className="flex justify-between items-center p-4 border rounded"
              >
                <div>
                  <p className="font-semibold">{employee.name}</p>
                  <p>{employee.email}</p>
                  <p>角色: {employee.role}</p>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={employee.role}
                    onChange={(e) =>
                      handleRoleChange(employee.id, e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="Manager">經理</option>
                    <option value="Staff">員工</option>
                  </select>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    刪除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>目前沒有員工。</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
