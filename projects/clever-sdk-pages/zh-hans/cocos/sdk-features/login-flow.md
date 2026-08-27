# 登录流程详解

Clever SDK 提供统一的登录接口 `sdk.login()`，但是不同的平台有不同的登录校验方式，仍需要做一些配置。

## 统一登录接口

```ts
import {LoginData} from "@lingames/clever-sdk/src/models/LoginData";

// 所有登录模式都使用相同的接口
(window as any).mySdk.login().then((data: LoginData) => {
    console.log('登录成功', data);
    // 根据不同登录模式进行后续处理
}).catch((err: any) => {
    console.error('登录失败', err);
});
```

### 平台登录

**适用场景**: 直接使用平台原生登录，如华为快游戏。

**特点**: 
- 不需要后端服务器参与
- 只需要配置 `game_id`

**配置示例**:
```ts
import {createSdk} from "@lingames/clever-sdk/src";
import {DynamicSdkConfig} from "@lingames/clever-sdk/src/models";

// 华为快游戏运行时登录
const config: DynamicSdkConfig = {
    platform: 'huawei',
    project_id: 'your_project_id',
    game_id: 'your_huawei_app_id',
    sdk_login_url: 'https://api.salesagent.cc/game-analyzer/player/login',
};

const sdk = await createSdk(config);
const loginData = await sdk.login();
```

**流程说明**:
1. 调用相应的 `platform.login()`
2. SDK 直接调用平台登录 API
3. 运行时会返回平台的用户信息

### SDK 登录

**适用场景**: 使用 Clever SDK 服务器统一处理登录逻辑。

**特点**:
- SDK 服务器承担后端登录工作
- 需要配置 `project_id`

**配置示例**:
```ts
import {createSdk} from "@lingames/clever-sdk/src";
import {DynamicSdkConfig} from "@lingames/clever-sdk/src/models";

// SDK 登录配置
const config: DynamicSdkConfig = {
    platform: 'wechat',
    project_id: 'your_project_id',
    game_id: 'your_wx_app_id',
    sdk_login_url: 'https://api.salesagent.cc/game-analyzer/player/login',
};

const sdk = await createSdk(config);
const loginData = await sdk.login();
```

**流程说明**:
1. 调用相应的 `platform.login()`
2. 运行时返回临时登录凭证
3. SDK 将凭证发送到 SDK 服务器验证
4. SDK 服务器返回统一格式的用户信息

> TikTok 小游戏登录请单独配置 `sdk_login_url = "https://data.lingame.cn/user/login-tiktok"`，后端会按 `project_id` 读取项目级 `client_key` / `client_secret`。

### 3. 后端登录

**适用场景**: 游戏有自己的后端服务器，需要自定义登录逻辑。

**特点**:
- 需要游戏后端参与登录流程
- 需要配置后端登录相关参数
- 完全自定义登录和用户管理

**配置示例**:
```ts
import {createSdk} from "@lingames/clever-sdk/src";
import {DynamicSdkConfig} from "@lingames/clever-sdk/src/models";

// 后端登录配置
const config: DynamicSdkConfig = {
    platform: 'mock',
    project_id: 'your_project_id',
    game_id: 'your_game_id',
    sdk_login_url: 'https://your-game-server.com/api/login',
};

const sdk = await createSdk(config);
const loginData = await sdk.login();
```

**流程说明**:
1. 调用相应的 `platform.login()`
2. 运行时返回临时登录凭证
3. 游戏前端将凭证发送到自己的后端
4. 游戏后端验证并返回完整用户数据

## 登录模式对比

| 特性 | 运行时登录 | SDK 登录 | 后端登录 |
|------|------------|----------|----------|
| 接口调用 | `mySdk.login()` | `mySdk.login()` | `mySdk.login()` |
| 后端依赖 | 无 | SDK 服务器 | 游戏后端 |
| 配置复杂度 | 简单 | 中等 | 复杂 |
| 自定义程度 | 低 | 中等 | 高 |
| 适用场景 | 简单游戏 | 多平台游戏 | 复杂游戏系统 |
