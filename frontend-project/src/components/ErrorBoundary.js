// src/components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 以觸發下一個渲染
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 可以將錯誤日誌上報
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 自定義錯誤界面
      return <h1>抱歉，出現錯誤。</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;