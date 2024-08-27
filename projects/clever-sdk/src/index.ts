import {BilibiliSdk} from "./platformMini/BilibiliSdk";
import {BrowserSdk} from "./platformH5/BrowserSdk";
import {AdSenseSdk} from "./platformH5/AdSenseSdk";
import {WeChatSdk} from "./platformMini/WeChatSdk";
import {KuaiShouSdk} from "./platformMini/KuaiShouSdk";

export {BrowserSdk} from "./platformH5/BrowserSdk";
export {AdSenseSdk} from "./platformH5/AdSenseSdk";
export {WeChatSdk} from "./platformMini/WeChatSdk";
export {BilibiliSdk} from "./platformMini/BilibiliSdk";
export {KuaiShouSdk} from "./platformMini/KuaiShouSdk";

export async function createSdk(env: string, sdk_url: string, sdk_key: string, game_id: number, wx_tt?: any) {
    console.log('my sdk create:', env, game_id, typeof (wx_tt));
    if (env == 'WECHAT_GAME') {
        let ret = new WeChatSdk(env, sdk_url, sdk_key, game_id);
        return ret.initialize({wx: wx_tt})
    }
    if (env == 'douyingame') {
        return new WeChatSdk(env, sdk_url, sdk_key, game_id);
    }
    if (env == 'kuaishou') {
        return new KuaiShouSdk(env, sdk_url, sdk_key, game_id);
    }
    if (env == 'bilibili') {
        return new BilibiliSdk(env, sdk_url, sdk_key, game_id);
    }
    if (env == 'google') {
        return new AdSenseSdk(env, sdk_url, sdk_key, game_id);
    }

    return new BrowserSdk(env, sdk_url, sdk_key, game_id);
}