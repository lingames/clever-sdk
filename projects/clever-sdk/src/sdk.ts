/*
 * @Author: vegapan@hotmail.com 
 * @Date: 2024-05-28 16:17:06 
 * @Last Modified by: vegapan@hotmail.com
 * @Last Modified time: 2024-09-02 23:44:37
 */


// @ts-ignore
import {sha256} from './sha256.js';

declare namespace sys {
    const localStorage: any;
}

declare namespace GameGlobal {
    // function createSdk(env: string, sdk_url: string, sdk_key: string, game_id: number, wx_tt: any): BrowserSdk;
}


export class MySdk {
    protected platform: string;
    protected game_id: number;
    protected sdk_url: string;
    protected sdk_key: string;
    protected inner: any;
    protected videoAd: any = {};
    protected sdk_login_url: string = '';

    protected session_key: string = '';

    // game_id 游戏编号，每个游戏game_id唯一
    public async login(): Promise<any> {
        console.log('dummy-sdk login');
    }

    // async update(){"dummy-sdk update"}
    public async checkSession(): Promise<boolean> {
        return false;
    }

    public createRewardedVideoAd(adInfo: any): Promise<any> {
        return Promise.resolve({});
    }


    // 设为常用
    public async addCommonUse() {
    }

    public async checkCommonUse(): Promise<any> {
        return Promise.resolve({
            isSupport: false,
            isCommonUse: false
        });
    }

    public async addShortcut() {
    }

    public async checkShortcut(): Promise<any> {
        return Promise.resolve({
            isSupport: false,
            exist: true,
            needUpdate: false
        });
    }

    // 侧边栏复访
    public async checkScene(): Promise<any> {
        return Promise.resolve({
            isSupport: false,
            isScene: false
        });
    }

    public async navigateToScene() {
    }

    // 分享
    public async shareAppMessage(param: any): Promise<boolean> {
        return Promise.resolve(false);
    }

    // 获取用户信息
    public async getUserInfo(): Promise<any> {
        return Promise.resolve({});
    }


    constructor(platform: string, sdk_url: string, sdk_key: string, game_id: number, wx: any) {
        this.platform = platform;
        this.sdk_url = sdk_url;
        this.sdk_key = sdk_key;
        this.game_id = game_id;
        this.inner = wx;

        let t_sdk_url = this.sdk_url;
        if (t_sdk_url) {
            if (t_sdk_url[t_sdk_url.length - 1] == '/') {
                t_sdk_url = t_sdk_url.substring(0, t_sdk_url.length - 1);
            }
            if (platform == 'WECHAT_GAME') {
                this.sdk_login_url = t_sdk_url + '/weChatLogin';
            } else if (platform == 'douyingame') {
                this.sdk_login_url = t_sdk_url + '/byteDanceLogin';
            } else if (platform == 'kuaishou') {
                this.sdk_login_url = t_sdk_url + '/kuaishouLogin';
            } else {
                this.sdk_login_url = t_sdk_url + '/devLogin';
            }
        }
    }

    async initialize() {
        return;
    }

    // 广告接口
    async createBannerAd() {
        this.inner.createBannerAd();
    }


    // cb 玩家看广告结束的回调， isEnd: 广告是否看完, true:看完，false:中途退出
    // get_game_url(): string {
    //     // const useLocalNet = GGameData.GlobalData.get(GlobalDataType.UseLocalNet, false);
    //     const useLocalNet = true;
    //     if (useLocalNet)
    //         return "ws://localhost:8089/ws";
    //     return "wss://lingame.cn/ws/";
    //     // return "ws://124.222.91.167/ws/";
    // }
}


const promisify_wx = (fn: any) => {
    return async function (...args: any) {
        return new Promise((resolve, reject) => {
            globalValue['inner'][fn]({
                ...(args || {}),
                success: (res: any) => {
                    console.log('promisify_wx ok:', res);
                    resolve(res);
                },
                fail: (err: any) => {
                    console.error('promisify_wx fail:', err);
                    reject(err);
                }
            });
        });
    };
};

const promisify_wx_a = (fn: any) => {
    return async function (args: any) {
        return new Promise((resolve, reject) => {
            globalValue['inner'][fn]({
                ...(args || {}),
                success: (res: any) => {
                    console.log('promisify_wx ok:', res);
                    resolve(res);
                },
                fail: (err: any) => {
                    console.error('promisify_wx fail:', err);
                    reject(err);
                }
            });
        });
    };
};

// const promisify_wx2 = (fn) => {
//     return async function (args) {
//         return new Promise((resolve, reject) => {
//             args.success = function (res) {
//                 resolve(res)
//             };

//             args.fail = function (err) {
//                 reject(err)
//             };

//             fn(args);
//         });
//     };
// }


const build_sdk_head = (key: string, req_body: string): any => {
    const now = get_ts();

    const sign_str = key + '&POST&' + now + '&' + req_body;
    console.log('--------------get hash 111', typeof (sha256));
    const sha_str = new sha256('SHA-256', 'TEXT', {encoding: 'UTF8'});
    console.log('--------------get hash 222');
    sha_str.update(sign_str);
    console.log('--------------get hash 333');
    const hash = sha_str.getHash('HEX');
    console.log('--------------get hash', hash);

    const headers = {
        'content-type': 'application/json',
        Authorization: hash,
        'X-MARS-Timestamp': now,
    };

    return headers;
};

const build_sdk_req = (game_id: number, key: string, code: string): [string, Map<string, string>] => {
    const req_body = JSON.stringify({
        game_id: game_id,
        session_id: code,
        Fields: {
            grant_type: 'authorization_code'
        }
    });
    const head = build_sdk_head(key, req_body);
    return [req_body, head];
};

const get_ts = () => {
    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return unixTimestamp;
};

const parse_sdk_resp = (resp: any) => {
    if (resp.statusCode != 200) {
        throw new Error('error status code:' + resp.statusCode);
    }

    const sdkResp = resp.data;
    if (sdkResp.ErrorCode && sdkResp.ErrorCode != 0) {
        throw new Error('sdk login error:' + JSON.stringify(resp.data));
    }

    console.log('sdk login ok:', sdkResp);
    return sdkResp;
};

// Promise<any> 
const promisify_request = () => {
    return async function (args: any): Promise<any> {
        return new Promise((resolve, reject) => {
            args.fail = (err: any) => {
                console.error('fail:', err);
                reject(err);
            };

            args.success = (res: any) => {
                console.log('success:', res.data);
                resolve(res);
            };
            globalValue['inner'].request(args);
        });
    };
};


export const http_request = (method: string, url: string, heads: Map<string, string>, body: string) => {
    let xhr = new XMLHttpRequest();

    xhr.open(method, url);
    for (const [k, v] of heads) {
        xhr.setRequestHeader(k, v);
    }

    return async function () {
        return new Promise((resolve, reject) => {
            xhr.onerror = function (err) {
                reject(err);
            };

            xhr.onreadystatechange = function () {
                console.log('----------', xhr.readyState, xhr.responseText);
                if (xhr.readyState == 4) {
                    let resp = null;
                    try {
                        if (xhr.responseText && xhr.responseText != '') {
                            resp = JSON.parse(xhr.responseText);
                            resolve(resp);
                        } else {
                            reject('xml http request no response');
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
            };
            xhr.send(body);
        });
    };
};


const generateRandomString = (length: number): string => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

class BrowserSdk extends MySdk {
    override async login() {
        let old_guid = sys.localStorage.getItem('MARS_LOCAL_GUID');
        if (old_guid) {
            console.log('load guid from cache', old_guid);
        } else {
            old_guid = generateRandomString(16);
            sys.localStorage.setItem('MARS_LOCAL_GUID', old_guid);
            console.log('load guid from create', old_guid);
        }
        const [req_body, req_header] = build_sdk_req(this.game_id, this.sdk_key, old_guid);
        console.log('my-sdk login url:', old_guid, this.sdk_login_url, req_body);

        try {
            const req = {
                url: this.sdk_login_url,
                data: req_body,
                method: 'POST',
                header: req_header
            };

            const ret: any = await http_request('POST', this.sdk_login_url, req_header, req_body)();
            // const ret = await promisify_request()(req);
            console.log('my-sdk login resp:', ret);

            this.session_key = ret.session_key;

            return ret;
        } catch (e: any) {
            console.error('browser sdk login fail:', e);
            throw new Error(e);
        }
    }

    public override createRewardedVideoAd(adInfo: any): Promise<any> {
        throw new Error('浏览器不支持广告');
    }

    // public override async addCommonUse() {
    //     throw new Error("浏览器不支持 addCommonUse")
    // }


    // public async checkCommonUse(): Promise<boolean> {
    //     return false
    // }

    public override async addShortcut() {
        throw new Error('浏览器不支持 addShortcut');
    }

    // public async checkShortcut(): Promise<any> {
    //     return { isSupport: false, exist: true, needUpdate: false };
    // }
}

//* 谷歌平台 */
class AdSenseSdk extends BrowserSdk {
    async initialize(): Promise<void> {
        const script = document.createElement('script');
        script.async = true;
        // if (process.env.NODE_ENV !== 'production') {
        //     script.setAttribute('data-adbreak-test', 'on');
        // }
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.videoAd["adSenseId"]}`;
        script.crossOrigin = 'anonymous';
        // 将 script 元素插入到文档中
        document.body.appendChild(script);
        // @ts-ignore
        window.adsbygoogle = window.adsbygoogle || [];
        // @ts-ignore
        window.adBreak = function (o) {
            // @ts-ignore
            adsbygoogle.push(o);
        }
        // @ts-ignore
        window.adConfig = function (o) {
            // @ts-ignore
            adsbygoogle.push(o);
        }
        // @ts-ignore
        window.adConfig({
            sound: 'on',
            preloadAdBreaks: 'on',
            onReady: () => {
                console.log("AdSense onReady");
            },
        })
    }

    public override createRewardedVideoAd(adInfo: any): Promise<any> {

        return new Promise((resolve, reject) => {
            // @ts-ignore
            window["adBreak"] && window["adBreak"]({
                // ad shows at start of next level
                type: 'reward',
                name: 'restart-game',
                beforeAd: () => {
                    console.log("激励视频开始播放");
                },
                // You may also want to mute the game's sound.
                afterAd: () => {
                    //关闭，观看完成都会走这里
                    console.log("激励视频播放结束");
                },
                // resume the game flow.
                // @ts-ignore
                beforeReward: (showAdFn) => {
                    showAdFn && showAdFn();
                },
                adDismissed: () => {
                    console.log("中途关闭广告");
                },
                adViewed: () => {
                    //google建议设置状态码，在afterAd中处理奖励逻辑
                    console.log("玩家完整看完广告");
                },
                adBreakDone: () => {
                    //Always called (if provided) even if an ad didn't show（始终调用，即使广告展示失败了）
                }
            });
        })
    }
}

class WeChatSdk extends MySdk {
    override async login() {
        const login_ret: any = await promisify_wx('login')();
        console.log('third-sdk login ret:', login_ret);
        if (!login_ret.code) {
            console.error('third-sdk login error:', login_ret.errMsg);
            return;
        }
        console.log('third-sdk login ok:', login_ret.code);

        const [req_body, req_header] = build_sdk_req(this.game_id, this.sdk_key, login_ret.code);
        const req = {
            url: this.sdk_login_url,
            data: req_body,
            method: 'POST',
            header: req_header
        };
        console.log('my-sdk ready to code2session:', this.sdk_login_url, JSON.stringify(req));

        // const ret: any = await promisify_wx2(this.inner.request)(req);
        // const sdkResp: any = await http_request("POST", this.sdk_login_url, req_header, req_body)();
        const ret = await promisify_request()(req);
        // if (!ret.data){
        //     throw new Error("fail to login sdk")
        // }
        console.log('my-sdk login resp:', ret);

        const sdkResp = parse_sdk_resp(ret);
        this.session_key = sdkResp.session_key;

        return sdkResp;
    }

    // 建议每秒调用一次，不需要太频繁
    // async update(){
    //     if (this.sdk_login_url){
    //         try {
    //             await promisify_wx(this.inner.checkSession)();
    //         }catch (e){
    //             await this.login()
    //             console.warn("the secret key expired")
    //         }
    //     }
    // }
    // true表示session_key已经过期
    override async checkSession(): Promise<boolean> {
        try {
            await promisify_wx('checkSession')();
            return true;
        } catch (e) {
            return false;
        }
    }

    // adInfo{adUnitId:广告单元id} 广告单元id需要在小程序后台 流量主界面创建
    // cb 玩家看广告结束的回调， isEnd: 广告是否看完, true:看完，false:中途退出
    public override createRewardedVideoAd(adInfo: any): Promise<any> {
        let videoAd = this.videoAd['adUnitId'];
        console.log('createRewardedVideoAd', adInfo, videoAd);
        if (!videoAd) {
            videoAd = this.inner.createRewardedVideoAd(adInfo);
            this.videoAd['adUnitId'] = videoAd;
        }

        return new Promise((resolve, reject) => {
            let fn = '';
            if (typeof (videoAd.show) !== 'undefined') {
                fn = 'show';
            } else if (typeof (videoAd.load) !== 'undefined') {
                fn = 'load';
            } else {
                console.error('unsupported createRewardedVideoAd');
                return;
            }

            videoAd.onError((err: any) => {
                console.error(err);
            });

            // 视频关闭
            videoAd.onClose((res: any) => {
                console.log(res);
                if ((res && res.isEnded) || res === undefined) {
                    res = res || {
                        isEnded: true,
                        count: 1
                    };
                    res.count = res.count || 1;
                    console.info('广告观看结束，此处添加奖励代码', res);
                    resolve(res);
                } else {
                    resolve(res);
                    console.error('广告没看完，不能获奖');
                }
            });

            try {
                videoAd[fn](adInfo);
            } catch (e: any) {
                console.error('show videoAd err:', e);
            }
        });
    }

    public override async addCommonUse() {
        if (typeof (this.inner['addCommonUse']) == 'undefined') {
            console.error('不支持addCommonUse');
        }

        const checkRet = await this.checkCommonUse();
        if (!checkRet.isSupport || checkRet.isCommonUse) {
            console.log('已经设置为常用，不再重复');
            return;
        }

        await promisify_wx('addCommonUse')();
    }

    public async checkCommonUse(): Promise<any> {
        if (typeof (this.inner['checkCommonUse']) == 'undefined') {
            console.error('不支持checkCommonUse');
            return {
                isSupport: false,
                isCommonUse: false
            };
        }

        try {
            const ret: any = await promisify_wx('checkCommonUse')();
            console.log('checkCommonUse-ret:', ret);
            return {
                isSupport: true,
                isCommonUse: ret.isCommonUse
            };
        } catch (e) {
            return {
                isSupport: true,
                isCommonUse: false
            };
        }
    }


    public override async addShortcut() {
        if (typeof (this.inner['addShortcut']) == 'undefined') {
            console.error('不支持addShortcut');
        }


        // const needAdd = await this.checkShortcut()
        // if (needAdd.exist || needAdd.needUpdate) {
        //     console.log("已经设置为addShortcut，不再重复")
        //     return;
        // }

        await promisify_wx('addShortcut')();
    }

    public async checkShortcut(): Promise<any> {
        if (typeof (this.inner['checkShortcut']) == 'undefined') {
            console.error('不支持checkShortcut');
            return {
                isSupport: false,
                exist: true,
                needUpdate: false
            };
        }

        try {
            const ret: any = await promisify_wx('checkShortcut')();
            console.log('checkShortcut-ret:', ret);
            return {
                isSupport: true,
                exist: ret.installed || ret.exist,
                needUpdate: ret.needUpdate
            };
        } catch (e: any) {
            if (e.msg === 'apk info is invalid') {
                return {
                    isSupport: true,
                    exist: false,
                    needUpdate: false
                };
            }
            return {
                isSupport: true,
                exist: true,
                needUpdate: false
            };
        }
    }


    // 抖音侧边栏访问功能
    public async checkScene(): Promise<any> {
        if (typeof (this.inner['checkScene']) == 'undefined') {
            console.error('不支持checkScene');
            return {
                isSupport: false,
                isScene: false
            };
        }

        try {
            const ret: any = await promisify_wx_a('checkScene')({scene: 'sidebar'});
            console.log('checkScene-ret:', ret);
            return {
                isSupport: false,
                isScene: ret.isExist
            };
        } catch (e) {
            return {
                isSupport: true,
                isScene: false
            };
        }
    }

    public async navigateToScene() {
        if (typeof (this.inner['navigateToScene']) == 'undefined') {
            console.error('不支持navigateToScene');
            return;
        }

        try {
            const ret: any = await promisify_wx_a('navigateToScene')({scene: 'sidebar'});
            console.log('navigateToScene-ret:', ret);
        } catch (e) {
            console.error('navigateToScene', e);
        }
    }


    public async shareAppMessage(param: any): Promise<boolean> {
        if (typeof (this.inner['shareAppMessage']) == 'undefined') {
            console.error('不支持shareAppMessage');
            return false;
        }


        try {
            await promisify_wx_a('shareAppMessage')(param);
            return true;
        } catch (e: any) {
            return false;
        }
    }

    public async getUserInfo(): Promise<any> {
        if (typeof (this.inner['getUserInfo']) == 'undefined') {
            console.error('不支持getUserInfo');
            return {};
        }

        try {
            return await promisify_wx_a('getUserInfo')({});
        } catch (e: any) {
            return false;
        }
    }
}


export const createSdk = (env: string, sdk_url: string, sdk_key: string, game_id: number, wx_tt: any) => {
    console.log('my sdk create:', env, game_id, typeof (wx_tt));
    if (env == 'WECHAT_GAME' || env == 'douyingame' || env == 'kuaishou') {
        globalValue['inner'] = wx_tt;
        let ret = new WeChatSdk(env, sdk_url, sdk_key, game_id, wx_tt);

        globalValue['mySdk'] = ret;
        return ret;
    }

    return new BrowserSdk(env, sdk_url, sdk_key, game_id, wx_tt);
};

// @ts-ignore
let globalValue = GameGlobal;

globalValue['createSdk'] = createSdk;