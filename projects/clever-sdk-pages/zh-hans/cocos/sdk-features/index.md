# SDK 功能

Clever SDK 提供了丰富的功能，帮助你快速开发和运营游戏。

## 1. 登录

SDK 提供了统一的登录接口，支持多种平台登录方式。登录系统包含三个层次：平台登录、SDK 登录和后端登录。

> 📖 **详细登录流程说明**: 请参考 [登录流程详解](./login-flow.md) 了解三种登录模式的区别和完整流程。

### 基本登录

```ts
import {LoginData} from "@lingames/clever-sdk/src/models/LoginData";

(window as any).mySdk.login().then((data: LoginData) => {
    console.log('SDK 登录成功', data);
    // data 中包含 openid, session_key 等信息
}).catch((err: any) => {
    console.error('SDK 登录失败', err);
});
```

### LoginData 返回数据说明

`LoginData` 对象包含以下字段：

- **openid**: 用户在当前平台的唯一标识符
- **session_key**: SDK 会话密钥，用于后续 API 调用验证
- **nickname**: 用户昵称（如果平台支持）
- **avatar**: 用户头像 URL（如果平台支持）
- **其他平台特定字段**: 根据不同平台可能包含额外信息

### 登录参数配置

登录功能依赖以下配置参数：

- **game_id**: 平台分配的游戏 ID，用于平台登录 API 调用
- **project_id**: 项目标识，用于 SDK 服务器识别
- **platform**: 平台标识，用于后端交互路由
- **sdk_login_url**: SDK 登录服务器地址

### 完整登录流程示例

```ts
// 完整的登录流程，包含 SDK 登录和后端登录
async function performFullLogin() {
    try {
        // 1. SDK 登录
        const sdkLoginData = await (window as any).mySdk.login();
        console.log('SDK 登录成功:', sdkLoginData);
        
        // 2. 使用 SDK 登录信息进行后端登录
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                openid: sdkLoginData.openid,
                platform: 'wechat', // 或其他平台
                session_key: sdkLoginData.session_key
            })
        });
        
        const backendLoginData = await response.json();
        console.log('后端登录成功:', backendLoginData);
        
        // 3. 保存登录状态，进入游戏
        localStorage.setItem('gameSession', backendLoginData.token);
        enterGame();
        
    } catch (error) {
        console.error('登录流程失败:', error);
        showLoginError(error);
    }
}
```

## 2. 会话检查

用于检查当前用户会话是否有效。

```ts
(window as any).mySdk.checkSession().then((isValid: boolean) => {
    if (isValid) {
        console.log('会话有效');
    } else {
        console.log('会话无效，需要重新登录');
    }
});
```

## 3. 添加到常用/桌面

部分平台支持将游戏添加到用户的常用列表或桌面快捷方式。

### 添加到常用

```ts
(window as any).mySdk.addCommonUse().then(() => {
    console.log('添加到常用成功');
}).catch((err: any) => {
    console.error('添加到常用失败', err);
});
```

### 检查是否已添加到常用

```ts
(window as any).mySdk.checkCommonUse().then((res: any) => {
    if (res.isSupport && res.isCommonUse) {
        console.log('已添加到常用');
    } else {
        console.log('未添加到常用或不支持');
    }
});
```

### 添加到桌面快捷方式

```ts
import {AddShortcut} from "@lingames/clever-sdk/src/models/AddShortcut";

(window as any).mySdk.addShortcut({
    title: "我的游戏",
    imageUrl: "http://example.com/icon.png"
}).then(() => {
    console.log('添加到桌面成功');
}).catch((err: any) => {
    console.error('添加到桌面失败', err);
});
```

### 检查是否已添加到桌面

```ts
(window as any).mySdk.checkShortcut().then((res: any) => {
    if (res.isSupport && res.exist) {
        console.log('已添加到桌面');
    } else {
        console.log('未添加到桌面或不支持');
    }
});
```

## 4. 场景检查与跳转

用于检查当前宿主版本是否支持跳转某个小游戏入口场景，目前仅支持「侧边栏」场景。

### 检查场景

```ts
(window as any).mySdk.checkScene().then((res: any) => {
    if (res.isSupport && res.isScene) {
        console.log('当前在支持的场景中');
    } else {
        console.log('当前不在支持的场景中或不支持');
    }
});
```

### 跳转场景

```ts
(window as any).mySdk.navigateToScene().then(() => {
    console.log('跳转场景成功');
}).catch((err: any) => {
    console.error('跳转场景失败', err);
});
```

## 5. 分享

分享游戏给好友或社交平台。

```ts
(window as any).mySdk.shareAppMessage({
    title: "快来玩我的游戏！",
    imageUrl: "http://example.com/share_image.png",
    query: "foo=bar&baz=qux" // 分享参数
}).then((success: boolean) => {
    if (success) {
        console.log('分享成功');
    } else {
        console.log('分享失败');
    }
});
```

## 6. 获取用户信息

获取用户的基本信息，如昵称、头像等。

```ts
(window as any).mySdk.getUserInfo().then((userInfo: any) => {
    console.log('获取用户信息成功', userInfo);
}).catch((err: any) => {
    console.error('获取用户信息失败', err);
});
```

## 7. Mock 平台开发测试

Mock 平台提供完整的 SDK 功能模拟，方便开发者在浏览器环境中进行开发和测试。

### 7.1 Mock 平台配置

```ts
import {createSdk} from "@lingames/clever-sdk/src";
import {DynamicSdkConfig} from "@lingames/clever-sdk/src/models";

const mockConfig: DynamicSdkConfig = {
    platform: "mock",
    project_id: "test_project_id",
    game_id: "mock_game_id",
    sdk_login_url: "https://mock-api.example.com",
    sdk_event_key: "mock_event_key",
    mockConfig: {
        enableMockAds: true,           // 启用模拟广告
        mockAdDelay: 2000,             // 广告加载延迟 2 秒
        mockAdSuccessRate: 0.8,        // 80% 成功率
        enableMockLogin: true,         // 启用模拟登录
        mockUserInfo: {
            nickname: "测试用户",
            avatar: "https://example.com/avatar.png"
        },
        enableConsoleLog: true         // 启用控制台日志
    }
};

const sdk = await createSdk(mockConfig);
(window as any).mySdk = sdk;
```

### 7.2 Mock 功能特性

- **模拟广告**: 支持激励视频、横幅广告、原生广告的完整模拟
- **模拟登录**: 提供可配置的用户信息和登录状态
- **可视化界面**: Mock 广告会显示模拟的广告界面
- **控制台日志**: 详细的操作日志，方便调试
- **可配置行为**: 可以调整成功率、延迟时间等参数



### 7.3 Mock 平台优势

1. **快速开发**: 无需依赖真实平台环境，可以快速进行功能开发
2. **功能测试**: 可以模拟各种成功/失败场景，全面测试应用逻辑
3. **UI 验证**: Mock 广告提供可视化界面，验证 UI 集成效果
4. **调试友好**: 详细的控制台日志，帮助快速定位问题
5. **配置灵活**: 支持动态调整模拟行为，适应不同测试需求
