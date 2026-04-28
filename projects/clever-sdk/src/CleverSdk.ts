/* eslint-disable no-unused-vars */
import { PlayRewardedVideo, VideoReward } from "./models/PlayRewardedVideo";
import { CreateBannerAd } from "./models/CreateBannerAd";
import { CreateInterstitialAd } from "./models/CreateInterstitialAd";
import { SdkInitialize } from "./models/SdkInitialize";
import { AddShortcut } from "./models/AddShortcut";
import { LoginData } from "./models/LoginData";
import { CreateNativeAd } from "./models/CreateNativeAd";
import { ShareAppMessage } from "./models/ShareAppMessage";
import { NavigateToScene } from "./models/NavigateToScene";
import { AdvertiseStage } from "./models/AdvertiseStage";
import { ReportContext } from "./models/ReportContext";

export class CleverSdk {
    // 平台名称
    protected project_id: string;
    protected channel_id?: string;
    protected player_anonymous?: string;
    protected player_id?: string;
    protected version_id?: string;
    protected platform: string;
    // game_id 游戏编号，每个游戏 game_id 唯一
    protected game_id: string;
    protected sdk_url: string = "";
    protected sdk_key: string = "";

    // protected adUnitId: string = '';
    protected sdk_login_url: string = "";
    protected session_key: string = "";

    constructor(platform: string, project_id: string, game_id: string) {
        this.platform = platform;
        this.project_id = project_id;
        this.game_id = game_id;
        this.session_key = "";
    }

    /** 初始化平台参数
     * @param config 平台特有参数
     * @returns 是否初始化成功
     * */
    public async initialize(config: SdkInitialize): Promise<boolean> {
        return true;
    }

    public async login(): Promise<LoginData> {
        return {
            open_id: "",
            union_id: "",
            session_key: "",
        };
    }

    // async update(){"dummy-sdk update"}
    public async checkSession(): Promise<boolean> {
        return false;
    }

    /**
     * 播放激励广告, 如果未创建的话, 创建一个
     */
    public async playRewardedVideo(adInfo: PlayRewardedVideo): Promise<VideoReward> {
        return Promise.resolve({
            isEnded: false,
            count: 0,
        });
    }

    // 广告接口
    public async createBannerAd(adInfo: CreateBannerAd): Promise<VideoReward> {
        return this.showBannerAd();
    }

    public async showBannerAd(): Promise<VideoReward> {
        return {
            isEnded: false,
            count: 0,
        };
    }

    public async hideBannerAd(): Promise<boolean> {
        return true;
    }

    public async destroyBannerAd(): Promise<boolean> {
        return true;
    }

    // 插屏广告接口
    public async showInterstitialAd(adInfo: CreateInterstitialAd): Promise<VideoReward> {
        return { isEnded: false, count: 0 };
    }

    // 原生广告接口
    public async createNativeAd(adInfo: CreateNativeAd): Promise<object> {
        return {};
    }

    public async showNativeAd(): Promise<boolean> {
        return false;
    }

    public async hideNativeAd(): Promise<boolean> {
        return true;
    }

    public async destroyNativeAd(): Promise<boolean> {
        return true;
    }

    /**
     * 设为常用
     */
    public async addCommonUse(): Promise<boolean> {
        throw new Error(`${this.platform} 平台不支持 'addCommonUse'`);
    }

    public async checkCommonUse(): Promise<any> {
        return Promise.resolve({
            isSupport: false,
            isCommonUse: false,
        });
    }

    /**
     * 添加到桌面
     */
    public async addShortcut(options: AddShortcut): Promise<boolean> {
        throw new Error(`${this.platform} 平台不支持 'addShortcut'`);
    }

    /**
     * 检查是否已经添加到了桌面
     */
    public async checkShortcut(): Promise<any> {
        return Promise.resolve({
            isSupport: false,
            exist: true,
            needUpdate: false,
        });
    }

    // 侧边栏复访
    // 确认当前宿主版本是否支持跳转某个小游戏入口场景，目前仅支持「侧边栏」场景。
    public async checkScene(): Promise<any> {
        return Promise.resolve({
            isSupport: false,
            isScene: false,
        });
    }

    public async checkSliderBarIsAvailable(): Promise<boolean> {
        return false;
    }

    public async navigateToScene(scene: NavigateToScene): Promise<boolean> {
        return false;
    }

    // 分享
    public async shareAppMessage(share: ShareAppMessage): Promise<boolean> {
        return Promise.resolve(false);
    }

    // 获取用户信息
    public async getUserInfo(options: any): Promise<any> {
        return Promise.resolve({});
    }

    public reportContext(context: ReportContext): void {
        if (context.channel_id != undefined) {
            this.channel_id = context.channel_id;
        }
        if (context.player_anonymous != undefined) {
            this.player_anonymous = context.player_anonymous;
        }
        if (context.player_id != undefined) {
            this.player_id = context.player_id;
        }
        if (context.version_id != undefined) {
            this.version_id = context.version_id;
        }
    }

    public async reportAdvertise(id: string, stage: AdvertiseStage, data: Record<string, any>): Promise<boolean> {
        if (stage == AdvertiseStage.Expose) {
            data.status = 0;
        } else if (stage == AdvertiseStage.Click) {
            data.status = 1;
        } else if (stage == AdvertiseStage.Fill) {
            data.status = 2;
        } else if (stage == AdvertiseStage.Complete) {
            data.status = 3;
        } else {
            data.status = -1;
        }
        return await this.reportEvent(id, data);
    }

    public async reportEvent(id: string, data: Record<string, any>): Promise<boolean> {
        return Promise.resolve(false);
    }
}
