import { storeAuthToken } from "@utils/tokenStorage";
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function updateImportsInFile(filePath) {
  const fileExtension = path.extname(filePath);
  if (fileExtension !== '.js' && fileExtension !== '.jsx') {
    return;
  }

  let fileContent = fs.readFileSync(filePath, 'utf8');

  const importRegex = /import\s+\{\s*jwtDecode\s*\}\s+from\s+['"]jwt-decode['"];?/g;

  if (importRegex.test(fileContent)) {
    console.log(`Updating imports in file: ${filePath}`);

    // 替换导入语句
    fileContent = fileContent.replace(importRegex, "import jwtDecode from 'jwt-decode';");

    // 写回文件
    fs.writeFileSync(filePath, fileContent, 'utf8');
  }
}

function traverseDirectory(dir) {
  fs.readdirSync(dir).forEach((fileOrDir) => {
    const fullPath = path.join(dir, fileOrDir);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else {
      updateImportsInFile(fullPath);
    }
  });
}

// 开始遍历
traverseDirectory(directoryPath);

console.log('All imports have been updated.');