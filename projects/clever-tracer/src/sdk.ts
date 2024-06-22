/*
 * @Author: vegapan@hotmail.com 
 * @Date: 2024-05-28 16:17:06 
 * @Last Modified by: vegapan@hotmail.com
 * @Last Modified time: 2024-09-02 23:44:37
 */


// @ts-ignore

export interface SdkInitialize { adSenseId: string }

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
    // TODO: 为什么不在 ctor 传???
    async initialize(info: SdkInitialize): Promise<boolean> {
        return true;
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


