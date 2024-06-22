export * from './sdk'
export {BrowserSdk} from "./platformH5/browserSdk";
export {AdSenseSdk} from "./platformH5/adSenseSdk";
export {WeChatSdk} from "./platformMini/weChatSdk";

import {BrowserSdk} from "./platformH5/browserSdk";
import {AdSenseSdk} from "./platformH5/adSenseSdk";
import {WeChatSdk} from "./platformMini/weChatSdk";

export function createSdk(env: string, sdk_url: string, sdk_key: string, game_id: number, wx_tt: any) {
    console.log('my sdk create:', env, game_id, typeof (wx_tt));
    if (env == 'WECHAT_GAME' || env == 'douyingame' || env == 'kuaishou') {
        globalValue['inner'] = wx_tt;
        let ret = new WeChatSdk(env, sdk_url, sdk_key, game_id, wx_tt);

        globalValue['mySdk'] = ret;
        return ret;
    }

    if (env == 'google') {
        return new AdSenseSdk(env, sdk_url, sdk_key, game_id, wx_tt);
    }

    return new BrowserSdk(env, sdk_url, sdk_key, game_id, wx_tt);
}

// @ts-ignore
let globalValue = GameGlobal;

globalValue['createSdk'] = createSdk;