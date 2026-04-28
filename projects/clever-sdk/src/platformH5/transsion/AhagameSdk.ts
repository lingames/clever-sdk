//* 传音 / Dlightek H5（Ahagame h5sdk）— 见 docs/transsion-ads.md */
import { ggCreateRewardedVideoAd, VideoReward } from "../../models/PlayRewardedVideo";
import { ggInitialize } from "../../models/SdkInitialize.js";
import { CleverSdk } from "../../CleverSdk";
import { TRANSSION_ADSDK_SCRIPT_URL } from "./constants.js";

interface H5Sdk {
    init: (appKey: string, top: string, left: string, bottom: string, right: string, options: any) => void;
    adConfig: (config: any) => void;
    adBreak: (config: any) => void;
    athenaSend: (event: string, ...params: any[]) => void;
    gameLoadingCompleted?: () => void;
}

// 扩展Window接口以支持h5sdk
declare global {
    interface Window {
        h5sdk?: H5Sdk;
    }
}

// @ts-ignore
export class AhagameSdk extends CleverSdk {
    initialize(config: ggInitialize): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const script = document.createElement("script");
            script.async = true;
            script.src = TRANSSION_ADSDK_SCRIPT_URL;
            // 不要设置 crossOrigin：设为 anonymous 时浏览器按 CORS 拉取脚本，hippoobox 未对 localhost 返回 ACAO，Creator 预览 (localhost:7456) 会整包失败。
            script.referrerPolicy = "no-referrer";
            // 将 script 元素插入到文档中
            document.body.appendChild(script);
            script.onload = function () {
                // @ts-ignore
                if (window.h5sdk) {
                    const adsense: Record<string, unknown> = {
                        client: config.adSenseId || "",
                        "data-ad-frequency-hint": config.adFrequencyHint || "45s",
                        "data-ad-channel": config.adChannel || "",
                        pauseCallback: config.pauseCallback || (() => {}),
                        resumeCallback: config.resumeCallback || (() => {}),
                        callback: () => {
                            console.log("Ahagame SDK initialized");
                            window.h5sdk.adConfig({
                                preloadAdBreaks: "on",
                                sound: "on",
                                onReady: () => {
                                    console.log("Ahagame Ad onReady");
                                },
                            });
                        },
                    };
                    if (config.adBreakTest === true) {
                        adsense["data-adbreak-test"] = "on";
                    }
                    const options = {
                        ga: {
                            id: config.gaId || "",
                        },
                        adsense,
                    };

                    window.h5sdk.init(config.appKey || "", "", "", "", "", options);
                    try {
                        window.h5sdk.gameLoadingCompleted?.();
                    } catch {
                        /* ignore */
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            };

            script.onerror = function (err) {
                resolve(false);
            };
        });
    }

    playRewardedVideo(adInfo: ggCreateRewardedVideoAd): Promise<VideoReward> {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            window.h5sdk &&
                window.h5sdk.adBreak({
                    type: "reward",
                    name: adInfo.name || "my_reward",
                    beforeAd:
                        adInfo.beforeAd ||
                        (() => {
                            console.log("激励视频开始播放");
                        }),
                    afterAd:
                        adInfo.afterAd ||
                        (() => {
                            console.log("激励视频播放结束");
                            resolve({
                                isEnded: true,
                                count: 1,
                            });
                        }),
                    beforeReward: (showAdFn: () => void) => {
                        showAdFn && showAdFn();
                    },
                    adDismissed: () => {
                        console.log("中途关闭广告");
                        resolve({
                            isEnded: false,
                            count: 1,
                        });
                    },
                    adViewed: () => {
                        console.log("玩家完整看完广告");
                        resolve({
                            isEnded: true,
                            count: 1,
                        });
                    },
                    adBreakDone: (placementInfo: any) => {
                        console.log("adBreakDone:", placementInfo);
                    },
                });
        });
    }

    async showRewardedVideoAd(): Promise<VideoReward> {
        return this.playRewardedVideo({ adUnitId: "", name: "show_reward" });
    }

    async createBannerAd(adInfo: any): Promise<VideoReward> {
        // 创建Banner广告容器
        let adContainer = document.getElementById("ahagame-banner-container");
        if (!adContainer) {
            adContainer = document.createElement("div");
            adContainer.id = "ahagame-banner-container";
            adContainer.style.position = "fixed";
            adContainer.style.bottom = "0";
            adContainer.style.left = "0";
            adContainer.style.width = "100%";
            adContainer.style.zIndex = "9999";
            document.body.appendChild(adContainer);
        }

        // 添加Banner广告代码
        adContainer.innerHTML = `
            <ins class="adsbygoogle"
                 style="display:inline-block;width:320px;height:50px"
                 data-ad-client="${adInfo.client || ""}"
                 data-ad-slot="${adInfo.slot || ""}"></ins>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        `;

        return { isEnded: true, count: 1 };
    }

    async showBannerAd(): Promise<VideoReward> {
        const adContainer = document.getElementById("ahagame-banner-container");
        if (adContainer) {
            adContainer.style.display = "block";
            return { isEnded: true, count: 1 };
        }
        return { isEnded: false, count: 0 };
    }

    async hideBannerAd(): Promise<boolean> {
        const adContainer = document.getElementById("ahagame-banner-container");
        if (adContainer) {
            adContainer.style.display = "none";
            return true;
        }
        return false;
    }

    async destroyBannerAd(): Promise<boolean> {
        const adContainer = document.getElementById("ahagame-banner-container");
        if (adContainer) {
            adContainer.remove();
            return true;
        }
        return false;
    }

    // 展示插页式广告
    async showInterstitialAd(adInfo: any): Promise<VideoReward> {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            window.h5sdk &&
                window.h5sdk.adBreak({
                    type: adInfo.type || "start",
                    name: adInfo.name || "my_interstitial",
                    beforeAd:
                        adInfo.beforeAd ||
                        (() => {
                            console.log("插页式广告开始播放");
                        }),
                    afterAd:
                        adInfo.afterAd ||
                        (() => {
                            console.log("插页式广告播放结束");
                            resolve({
                                isEnded: true,
                                count: 1,
                            });
                        }),
                    adBreakDone: (placementInfo: any) => {
                        console.log("adBreakDone:", placementInfo);
                    },
                });
        });
    }

    // Athena埋点上报
    public async reportEvent(id: string, data: Record<string, any>): Promise<boolean> {
        try {
            // @ts-ignore
            if (window.h5sdk && window.h5sdk.athenaSend) {
                // 构建参数
                const params = Object.values(data);
                if (params.length === 0) {
                    window.h5sdk.athenaSend(id);
                } else if (params.length === 1) {
                    window.h5sdk.athenaSend(id, params[0]);
                } else {
                    window.h5sdk.athenaSend(id, params[0], params[1]);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error("Athena埋点上报失败:", error);
            return false;
        }
    }

    // 游戏开始事件
    public async reportGameStart(gameName: string): Promise<boolean> {
        return this.reportEvent("game_start", { title: gameName });
    }

    // 加载开始事件
    public async reportLoadingBegin(): Promise<boolean> {
        return this.reportEvent("loading_begin", {});
    }

    // 加载结束事件
    public async reportLoadingEnd(): Promise<boolean> {
        return this.reportEvent("loading_end", {});
    }

    // 谷歌JS加载开始事件
    public async reportLoadAdsbygoogle(): Promise<boolean> {
        return this.reportEvent("load_adsbygoogle", {});
    }

    // 谷歌JS加载完毕事件
    public async reportLoadedAdsbygoogle(): Promise<boolean> {
        return this.reportEvent("loaded_adsbygoogle", {});
    }

    // 转屏提示页面事件
    public async reportTurnScreen(): Promise<boolean> {
        return this.reportEvent("turn_screen", {});
    }

    // 横屏动作事件
    public async reportHorizontal(): Promise<boolean> {
        return this.reportEvent("horizontal", {});
    }

    // 游戏主页面事件
    public async reportGamePage(): Promise<boolean> {
        return this.reportEvent("game_page", {});
    }

    // 关卡开始事件
    public async reportLevelBegin(level: number): Promise<boolean> {
        return this.reportEvent("level_begin", { level });
    }

    // 关卡结束事件
    public async reportLevelEnd(status: "Fail" | "Pass"): Promise<boolean> {
        return this.reportEvent("level_end", { status });
    }

    // 关卡奖励事件
    public async reportLevelReward(hasAdOption: number): Promise<boolean> {
        return this.reportEvent("level_reward", { hasAdOption });
    }

    // 过关点击事件
    public async reportLevelNext(): Promise<boolean> {
        return this.reportEvent("level_next", {});
    }

    // 激励点击事件
    public async reportRewardClick(scene: string): Promise<boolean> {
        return this.reportEvent("reward_click", { scene });
    }
}
