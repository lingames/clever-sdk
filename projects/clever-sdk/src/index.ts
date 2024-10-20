export * from "./platformH5";
export * from "./platformMini";
export {CleverSdk} from "./CleverSdk";

import {BilibiliSdk, HuaweiSdk, KuaiShouSdk, OppoSdk, WeChatSdk} from "./platformMini";
import {AdSenseSdk, BrowserSdk} from "./platformH5";
import {CleverSdk} from "./CleverSdk";
import {DynamicSdkConfig} from "./models";

export async function createSdk(config: DynamicSdkConfig): Promise<CleverSdk> {
    console.log('my sdk create:', config.platform, config.game_id, typeof (config.wx));
    if (config.platform == 'WECHAT_GAME') {
        let sdk = new WeChatSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
        await sdk.initialize({wx: config.wx});
        return sdk
    }
    if (config.platform == 'douyingame') {
        return new WeChatSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.platform == 'kuaishou') {
        return new KuaiShouSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.platform == 'bilibili') {
        return new BilibiliSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.platform == 'huawei') {
        return new HuaweiSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.platform == 'oppo') {
        return new OppoSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.platform == 'google') {
        let sdk = new AdSenseSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
        await sdk.initialize({adSenseId: config.adSenseId});
        return sdk
    }

    return new BrowserSdk(config.platform, config.sdk_url, config.sdk_key, config.game_id);
}