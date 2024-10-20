export * from "./platformH5";
export * from "./platformMini";
export {CleverSdk} from "./CleverSdk";

import {BilibiliSdk, KuaiShouSdk, WeChatSdk} from "./platformMini";
import {AdSenseSdk, BrowserSdk} from "./platformH5";
import {CleverSdk} from "./CleverSdk";
import {DynamicSdkConfig} from "./models";

export async function createSdk(config: DynamicSdkConfig): Promise<CleverSdk> {
    console.log('my sdk create:', config.env, config.game_id, typeof (config.wx));
    if (config.env == 'WECHAT_GAME') {
        let sdk = new WeChatSdk(config.env, config.sdk_url, config.sdk_key, config.game_id);
        await sdk.initialize({wx: config.wx});
        return sdk
    }
    if (config.env == 'douyingame') {
        return new WeChatSdk(config.env, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.env == 'kuaishou') {
        return new KuaiShouSdk(config.env, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.env == 'bilibili') {
        return new BilibiliSdk(config.env, config.sdk_url, config.sdk_key, config.game_id);
    }
    if (config.env == 'google') {
        let sdk = new AdSenseSdk(config.env, config.sdk_url, config.sdk_key, config.game_id);
        await sdk.initialize({adSenseId: config.adSenseId});
        return sdk
    }

    return new BrowserSdk(config.env, config.sdk_url, config.sdk_key, config.game_id);
}