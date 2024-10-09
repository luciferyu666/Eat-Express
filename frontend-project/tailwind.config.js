/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // 確保包含所有 src 目錄下的 JS/JSX/TS/TSX 文件
  ],
  theme: {
    extend: {
      // 這裡你可以擴展 Tailwind 的默認樣式，例如添加自定義顏色、字體等
    },
  },
  plugins: [
    // 如果需要可以在這裡添加 Tailwind 插件
  ],
};
