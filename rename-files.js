// rename-files.js
const fs = require('fs');
const path = require('path');

/**
 * 定义要处理的项目根目录和对应的源代码目录
 */
const projects = [
  {
    name: 'frontend-project',
    src: 'src',
  },
  {
    name: 'backend-project',
    src: '', // 后端源代码位于根目录下，无需子目录
  },
];

/**
 * 定义需要排除的目录
 */
const excludeDirs = ['node_modules', 'dist', 'build', '.git'];

/**
 * 重命名文件扩展名函数
 * @param {string} dir - 目录路径
 */
const renameFiles = (dir) => {
  if (!fs.existsSync(dir)) {
    console.error(`目录不存在: ${dir}`);
    return;
  }

  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 检查当前目录是否在排除目录列表中
      if (!excludeDirs.includes(file)) {
        renameFiles(fullPath); // 递归处理子目录
      } else {
        console.log(`跳过目录: ${fullPath}`);
      }
    } else {
      // 处理文件重命名
      if (file.endsWith('.js') && !file.endsWith('.d.js')) {
        const newPath = fullPath.replace(/\.js$/, '.js');
        fs.renameSync(fullPath, newPath);
        console.log(`重命名: ${fullPath} -> ${newPath}`);
      } else if (file.endsWith('.jsx')) { // 修正错误：将 .jsx 重命名为 .jsx
        const newPath = fullPath.replace(/\.jsx$/, '.jsx');
        fs.renameSync(fullPath, newPath);
        console.log(`重命名: ${fullPath} -> ${newPath}`);
      }
    }
  });
};

/**
 * 遍历每个项目并执行重命名
 */
projects.forEach((project) => {
  const projectPath = path.resolve(__dirname, project.name, project.src);
  console.log(`\n正在处理项目: ${projectPath}`);
  renameFiles(projectPath);
});