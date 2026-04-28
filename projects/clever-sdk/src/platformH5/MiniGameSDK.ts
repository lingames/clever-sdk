import { CleverSdk } from "../CleverSdk.js";
import { VideoReward } from "../models/PlayRewardedVideo.js";
import { minigameInitialize } from "../models/SdkInitialize.js";
import { minigameShareAppMessage } from "../models/ShareAppMessage.js";
import { LoginData } from "../models/LoginData.js";
import { EventEndPoint, LoginEndPoint } from "../models/index.js";

/** 微游SDK全局对象 */
export declare const minigame: any;
export declare const MiniGameAds: any;
export declare const MiniGameAnalytics: any;

export class MiniGameSDK extends CleverSdk {
    private isInited = false;

    /** 暂停游戏声音回调 */
    private pauseSoundCb?: Function;
    /** 恢复游戏声音回调 */
    private resumeSoundCb?: Function;

    /**
     * 设置暂停/恢复声音的回调
     * 播放广告前需要暂停游戏音效，播放完毕后恢复
     */
    setSoundCallbacks(pauseSound: Function, resumeSound: Function): void {
        this.pauseSoundCb = pauseSound;
        this.resumeSoundCb = resumeSound;
    }

    /**
     *
     * @param config 初始化
     * @returns
     */
    async initialize(config: minigameInitialize): Promise<boolean> {
        this.sdk_login_url = config.sdk_login_url ?? LoginEndPoint;

        const sdkUrl = config.sdk_script_url ?? "https://sdk.minigame.vip/js/1.1.1/minigame.js";

        // H5/浏览器环境下需要动态加载SDK脚本
        if (typeof minigame === "undefined") {
            try {
                await this.loadJsAsync(sdkUrl);
            } catch (error) {
                console.error("minigame sdk load error: ", error);
                return false;
            }
        }

        if (typeof minigame === "undefined") {
            console.error("minigame sdk not found after load");
            return false;
        }

        try {
            await minigame.initializeAsync();
            await minigame.startGameAsync();
            this.isInited = true;
            return true;
        } catch (error) {
            console.error("minigame init error: ", error);
            return false;
        }
    }

    async login(): Promise<LoginData> {
        // 微游Minigame平台不需要独立的登录流程
        // SDK初始化时已自动完成身份认证
        return {
            open_id: "",
            union_id: "",
            session_key: "",
        };
    }

    override async checkSession(): Promise<boolean> {
        return this.isInited;
    }

    /**
     * 播放激励视频广告
     */
    // https://business.minigame.com/developers/zh/docs/cocos-creatorchajiansdkjieruzhinan#%E5%B9%BF%E5%91%8A
    public override async playRewardedVideo(_adInfo: any): Promise<VideoReward> {
        return new Promise((resolve) => {
            if (!this.isInited) {
                console.log("===> minigame未初始化");
                resolve({ isEnded: false, count: 0 });
                return;
            }

            this.pauseSoundCb?.();
            MiniGameAds.showRewardedVideo()
                .then(() => {
                    // 正常播放结束，下发游戏奖励
                    this.resumeSoundCb?.();
                    resolve({ isEnded: true, count: 1 });
                })
                .catch(() => {
                    // 播放中途退出，不下发游戏奖励
                    this.resumeSoundCb?.();
                    resolve({ isEnded: false, count: 0 });
                });
        });
    }

    /**
     * 播放插屏广告（微游Minigame特有功能）
     */
    // https://business.minigame.com/developers/zh/docs/cocos-creatorchajiansdkjieruzhinan#%E5%B9%BF%E5%91%8A
    public async showInterstitial(): Promise<boolean> {
        if (!this.isInited) {
            console.log("===> minigame未初始化");
            return false;
        }
        this.pauseSoundCb?.();

        try {
            await MiniGameAds.showInterstitial();
            this.resumeSoundCb?.();
            return true;
        } catch (error) {
            this.resumeSoundCb?.();
            console.error("minigame初始化失败: ", error);
            return false;
        }
    }

    /**
     * 显示Banner广告
     */
    // https://business.minigame.com/developers/zh/docs/cocos-creatorchajiansdkjieruzhinan#%E5%B9%BF%E5%91%8A
    async showBannerAd(): Promise<VideoReward> {
        if (!this.isInited) {
            console.log("===> minigame not inited");
            return { isEnded: false, count: 0 };
        }

        try {
            await MiniGameAds.showBanner();
            return { isEnded: true, count: 1 };
        } catch (error) {
            console.error("minigame showBanner error: ", error);
            return { isEnded: false, count: 0 };
        }
    }

    /**
     * 隐藏Banner广告
     */
    // https://business.minigame.com/developers/zh/docs/cocos-creatorchajiansdkjieruzhinan#%E5%B9%BF%E5%91%8A
    async hideBannerAd(): Promise<boolean> {
        if (!this.isInited) {
            console.log("===> minigame not inited");
            return false;
        }

        try {
            await MiniGameAds.hideBanner();
            return true;
        } catch (error) {
            console.error("minigame hideBanner error: ", error);
            return false;
        }
    }

    /**
     * 获取当前语言环境
     */
    getLocale(): string {
        if (!this.isInited) {
            return "zh-CN";
        }
        return minigame.getLocale();
    }

    /**
     * 设置SDK加载进度（0-100）
     */
    setLoadingProgress(percentage: number): void {
        if (this.isInited && typeof minigame !== "undefined") {
            minigame.setLoadingProgress(percentage);
        }
    }

    /**
     * 分享
     */
    // https://business.minigame.com/developers/zh/docs/cocos-creatorchajiansdkjieruzhinan#%E5%88%86%E4%BA%AB
    async shareAppMessage(share: minigameShareAppMessage): Promise<boolean> {
        if (!this.isInited) {
            console.log("===> minigame not inited");
            return false;
        }

        try {
            await minigame.shareAsync({
                image: share.image,
                text: share.text,
                data: share.data,
                media: share.media,
            });
            console.log("minigame分享成功");
            return true;
        } catch (error) {
            console.error("minigame分享失败: ", error);
            return false;
        }
    }

    /**
     * 创建桌面快捷方式
     */
    // https://business.minigame.com/developers/zh/docs/cocos-creatorchajiansdkjieruzhinan#%E5%BF%AB%E6%8D%B7%E6%96%B9%E5%BC%8F
    async addShortcut(_options: any): Promise<boolean> {
        if (!this.isInited) {
            console.log("minigame未初始化");
            return false;
        }

        try {
            const canCreate = await minigame.canCreateShortcutAsync();
            if (canCreate) {
                await minigame.createShortcutAsync();
                console.log("minigame创建快捷方式成功");
                return true;
            }
            return false;
        } catch (error) {
            console.error("minigame创建快捷方式失败: ", error);
            return false;
        }
    }

    /**
     * 数据打点上报
     */
    async reportEvent(eventName: string, custom: Record<string, any>): Promise<boolean> {
        if (!this.isInited) {
            console.log("===> minigame not inited");
            return false;
        }

        // 优先使用微游自有统计
        if (typeof MiniGameAnalytics !== "undefined") {
            MiniGameAnalytics.onGameEvent(eventName, custom.label || "");
        }

        // 同时上报到自有事件系统
        try {
            const response = await fetch(EventEndPoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    player_anonymous: this.player_anonymous,
                    player_id: this.player_id,
                    channel_id: this.channel_id,
                    version_id: this.version_id,
                    event_id: eventName,
                    custom: custom,
                }),
            });
            return response.ok;
        } catch (error) {
            console.error("minigame reportEvent error: ", error);
            return false;
        }
    }

    // ========== 工具方法 ==========

    /**
     * 动态加载JS脚本
     */
    private loadJsAsync(src: string, async = true): Promise<void> {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            const scripts = document.getElementsByTagName("script");
            for (let i = 0; i < scripts.length; i++) {
                if (scripts[i].src === src) {
                    resolve();
                    return;
                }
            }

            const script = document.createElement("script");
            script.type = "text/javascript";
            script.async = async;
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }
}
