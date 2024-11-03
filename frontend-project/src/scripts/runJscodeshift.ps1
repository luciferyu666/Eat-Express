# C:\Tasker\食品外送系統開發\frontend-project\src\scripts\runJscodeshift.ps1

# 定义转换脚本的绝对路径，使用单引号避免反斜杠转义
$transformScript = 'C:\Tasker\食品外送系統開發\frontend-project\src\scripts\removeApiPrefix.js'

# 定义目标目录的绝对路径，使用单引号
$targetDirectory = 'C:\Tasker\食品外送系統開發\frontend-project\src'

# 检查转换脚本是否存在
if (-Not (Test-Path $transformScript)) {
    Write-Host "转换脚本未找到: $transformScript"
    exit 1
}

# 获取所有 .js 文件
$jsFiles = Get-ChildItem -Path $targetDirectory -Recurse -Filter *.js

if ($jsFiles.Count -eq 0) {
    Write-Host "没有找到任何 .js 文件在 $targetDirectory 目录下。"
    exit
}

foreach ($file in $jsFiles) {
    Write-Host "正在处理文件: $($file.FullName)"
    try {
        # 使用 & 符号调用 jscodeshift 并传递参数
        & jscodeshift -t $transformScript $file.FullName --verbose=2
        Write-Host "成功处理: $($file.FullName)`n"
    } catch {
        Write-Host "处理失败: $($file.FullName) - 错误: $_`n"
    }
}

Write-Host "所有文件处理完成。"