/*
 * @Author: vegapan@hotmail.com 
 * @Date: 2024-05-28 16:17:06 
 * @Last Modified by: vegapan@hotmail.com
 * @Last Modified time: 2024-09-02 23:44:37
 */


// @ts-ignore

import {BrowserSdk} from "./platformH5/browserSdk";
import {build_sdk_req, parse_sdk_resp, promisify_request, promisify_wx, promisify_wx_a} from "./helper";


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


export class WeChatSdk extends MySdk {
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