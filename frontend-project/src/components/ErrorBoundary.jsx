import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/ErrorBoundary.jsx

import React from 'react';

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - 子组件
 * @property {React.ReactNode} [fallback] - 自定义的备用 UI
 */

/**
 * @typedef {Object} ErrorBoundaryState
 * @property {boolean} hasError - 是否捕获到错误
 * @property {Error|null} error - 错误对象
 */

/**
 * ErrorBoundary 组件用于捕获其子组件树中的错误，
 * 并显示一个备用的 UI，防止整个应用崩溃。
 *
 * @extends {React.Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundary extends React.Component {
  /**
   * 构造函数
   *
   * @param {ErrorBoundaryProps} props - 组件属性
   */
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * 当子组件抛出错误时，这个静态方法会被调用，
   * 并更新 state 以显示备用 UI。
   *
   * @param {Error} error 错误对象
   * @returns {ErrorBoundaryState} 更新后的 state
   */
  static getDerivedStateFromError(error) {
    // 更新 state 以触发下一次渲染，显示备用 UI
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 当错误被捕获时，这个生命周期方法会被调用。
   * 您可以在这里将错误日志上报到错误追踪服务。
   *
   * @param {Error} error 错误对象
   * @param {React.ErrorInfo} errorInfo 错误信息
   */
  componentDidCatch(error, errorInfo) {
    // 您也可以将错误记录到错误追踪服务，如 Sentry、LogRocket 等
    console.error('ErrorBoundary 捕获到一个错误:', error, errorInfo);
    // 示例：使用 Sentry 记录错误
    // Sentry.captureException(error, { extra: errorInfo });
  }

  /**
   * 渲染组件。
   * 如果有错误，显示自定义的错误界面；否则，渲染子组件。
   *
   * @returns {React.ReactNode} 渲染的 React 元素
   */
  render() {
    if (this.state.hasError) {
      // 如果提供了自定义的备用 UI，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的自定义错误界面
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-4"
          role="alert"
        >
          <h1 className="text-4xl font-bold mb-4 text-red-600">
            抱歉，出现错误。
          </h1>
          <p className="text-red-500 mb-6 text-center">
            抱歉，发生了未知错误，请稍后再试。
            {/* 开发环境下显示错误信息 */}
            {process.env.NODE_ENV === 'development' && (
              <span className="block mt-2 text-sm">
                {this.state.error?.message}
              </span>
            )}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            尝试再次加载
          </button>
        </div>
      );
    }

    // 正常情况下，渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;
