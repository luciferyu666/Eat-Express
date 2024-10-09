// src/components/StatusToggle.js
import React from 'react';

const StatusToggle = ({ status, onToggleStatus }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">
        工作狀態：{status}
      </h2>
      <button
        className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition ease-in-out"
        onClick={onToggleStatus}
      >
        切換狀態
      </button>
    </div>
  );
};

export default StatusToggle;