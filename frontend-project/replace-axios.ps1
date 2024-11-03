# replace-axios.ps1
#
# 使用 jscodeshift 批量替换指定文件中的 `axios` 调用为 `axiosInstance`。
# 操作步骤：
# 1. 遍历指定的文件列表。
# 2. 对每个文件运行 jscodeshift 及其 Transformer 脚本。
# 3. 记录每个替换操作的日志。
# 4. 确保替换操作的安全性，包括文件存在性检查和备份建议。

# 定义需要处理的文件列表
$files = @(
    "src\components\DailyEarnings.js",
    "src\components\DeliveryPersonManagement.js",
    "src\components\LogoutButton.js",
    "src\components\MenuPage.js",
    "src\components\OperationalStatusMonitor.js",
    "src\components\OrderForm.js",
    "src\components\OrderStatusMonitor.js",
    "src\components\RestaurantLogin.js",
    "src\pages\DeliveryDashboard_.js",
    "src\pages\DeliveryOrderStatus.js",
    "src\pages\MenuPage.js",
    "src\services\authService.js",
    "src\services\axiosInstance.js"
)

# 定义 Transformer 脚本的路径（根据实际路径调整）
$transformerScript = ".\scripts\replaceAxiosWithInstance.js"

# 检查 Transformer 脚本是否存在
if (-Not (Test-Path $transformerScript)) {
    Write-Error "Transformer 脚本未找到：$transformerScript"
    exit 1
}

# 遍历每个文件并应用替换
foreach ($file in $files) {
    # 检查文件是否存在
    if (Test-Path $file) {
        Write-Host "正在处理文件：$file"
        
        try {
            # 运行 jscodeshift
            jscodeshift -t $transformerScript $file --extensions=js,jsx --parser=babel --verbose=2

            Write-Host "成功处理文件：$file" -ForegroundColor Green
        }
        catch {
            Write-Error "处理文件时出错：$file"
            Write-Error $_.Exception.Message
        }
    }
    else {
        Write-Warning "文件未找到，跳过：$file"
    }
}

Write-Host "批量替换完成。" -ForegroundColor Cyan