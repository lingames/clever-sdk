# Unity SDK 使用方法

Unity SDK 目前提供微信、抖音与 TikTok 小游戏的 WebGL 接入封装。核心入口为 `CleverSdkFactory.CreateSdk(...)`，不同平台传入对应的 `SdkConfig`。

## 平台文档

| 平台 | 文档 |
|------|------|
| TikTok 小游戏 | [TikTok Unity SDK 接入](./tiktok/) |

## 基本用法

```csharp
using CleverSDK;
using CleverSDK.Models;

var sdk = CleverSdkFactory.CreateSdk(new TiktokSdkConfig
{
    project_id = "your_project_id",
    sdk_login_url = "https://api.salesagent.cc/game-analyzer/player/login"
});

var loginData = await sdk.LoginAsync();
sdk.ReportContext(new EventReportContext
{
    player_anonymous = loginData.open_id
});
```
