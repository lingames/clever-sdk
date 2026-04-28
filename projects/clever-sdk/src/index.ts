export * from "./platformH5/index.js";
export * from "./platformMini/index.js";
export * from "./platformNative/index.js";
import { BilibiliSdk, DouyinSdk, HuaweiSdk, KuaiShouSdk, OppoSdk, WeChatSdk, TiktokSdk } from "./platformMini";
import { M4399Sdk } from "./platformNative";
import { CleverSdk } from "./CleverSdk.js";
import { AdSenseSdk, MiniGameSDK, MockSdk, AhagameSdk } from "./platformH5";
import { DynamicSdkConfig } from "./models";

export { CleverSdk };

export async function createSdk(config: DynamicSdkConfig): Promise<CleverSdk> {
    // Auto-detect platform if not provided
    let platform = config.platform || detectPlatform();

    // Get platform-specific game ID
    let gameId = getPlatformGameId(config, platform);

    if (platform == "wechat") {
        let sdk = new WeChatSdk(platform, config.project_id, gameId);
        await sdk.initialize({
            sdk_login_url: config.sdk_login_url,
        });
        return sdk;
    }
    if (platform == "dou-yin") {
        let sdk = new DouyinSdk(platform, config.project_id, gameId);
        await sdk.initialize({
            sdk_login_url: config.sdk_login_url,
        });
        return sdk;
    }
    if (platform == "tiktok") {
        let sdk = new TiktokSdk(platform, config.project_id, gameId);
        await sdk.initialize({
            sdk_login_url: config.sdk_login_url,
        });
        return sdk;
    }
    if (platform == "kuai-shou") {
        let sdk = new KuaiShouSdk(platform, config.project_id, gameId);
        await sdk.initialize({
            sdk_login_url: config.sdk_login_url,
        });
        return sdk;
    }
    if (platform == "bilibili") {
        return new BilibiliSdk(platform, config.sdk_login_url, config.project_id.toString());
    }
    if (platform == "hua-wei") {
        return new HuaweiSdk(platform, config.sdk_login_url, config.project_id.toString());
    }
    if (platform == "oppo") {
        return new OppoSdk(platform, config.sdk_login_url, config.project_id.toString());
    }
    if (platform == "google") {
        let sdk = new AdSenseSdk(platform, config.sdk_login_url, config.project_id.toString());
        await sdk.initialize({ adSenseId: "" });
        return sdk;
    }
    if (config.platform == "ahagame") {
        let sdk = new AhagameSdk(config.platform, config.project_id, config.game_id || "");
        const ahagameInit = config as any;
        await sdk.initialize({
            adSenseId: ahagameInit.adSenseId || "",
            appKey: ahagameInit.appKey || "",
            gaId: ahagameInit.gaId || "",
            adFrequencyHint: ahagameInit.adFrequencyHint || "45s",
            adChannel: ahagameInit.adChannel || "",
            adBreakTest: ahagameInit.adBreakTest,
            pauseCallback: ahagameInit.pauseCallback,
            resumeCallback: ahagameInit.resumeCallback,
        });
        return sdk;
    }
    if (platform == "m4399") {
        let sdk = new M4399Sdk(platform, config.project_id, gameId);
        await sdk.initialize({
            sdk_login_url: config.sdk_login_url,
        });
        return sdk;
    }
    if (platform == "minigame") {
        let sdk = new MiniGameSDK(platform, config.project_id, gameId);
        await sdk.initialize({
            sdk_login_url: config.sdk_login_url,
        });
        return sdk;
    }
    if (platform == "mock") {
        let sdk = new MockSdk(platform, config.project_id, gameId || "mock_game_id");
        const mockInit = config as any;
        await sdk.initialize(mockInit.mockConfig || {});
        return sdk;
    }
    return new MockSdk(platform, config.sdk_login_url, config.project_id.toString());
}

/**
 * Get platform-specific game ID
 */
function getPlatformGameId(config: DynamicSdkConfig, platform: string): string {
    switch (platform) {
        case "wechat":
            return config.wx_game_id || config.game_id || "";
        case "dou-yin":
            return config.dy_game_id || config.game_id || "";
        case "tiktok":
            return config.tt_game_id || config.game_id || "";
        case "kuai-shou":
            return config.ks_game_id || config.game_id || "";
        case "bilibili":
            return config.bb_game_id || config.game_id || "";
        case "hua-wei":
            return config.hw_game_id || config.game_id || "";
        case "oppo":
            return config.oppo_game_id || config.game_id || "";
        case "google":
            return config.google_game_id || config.game_id || "";
        case "minigame":
            return config.minigame_game_id || config.game_id || "";
        default:
            return config.game_id || "";
    }
}

/**
 * Auto-detect platform based on environment
 */
function detectPlatform(): string {
    const g = globalThis as any;
    if (typeof g.wx !== "undefined" && g.wx.getSystemInfo) {
        return "wechat";
    }
    if (typeof g.tt !== "undefined" && g.tt.getSystemInfo) {
        return "dou-yin";
    }
    if (typeof g.TTMinis !== "undefined" && g.TTMinis.getSystemInfoSync) {
        return "tiktok";
    }
    if (typeof g.ks !== "undefined" && g.ks.getSystemInfo) {
        return "kuai-shou";
    }
    if (typeof g.navigator !== "undefined") {
        const userAgent = g.navigator.userAgent.toLowerCase();
        if (userAgent.includes("bilibili")) {
            return "bilibili";
        }
        if (userAgent.includes("huawei") || userAgent.includes("honor")) {
            return "hua-wei";
        }
        if (userAgent.includes("oppo")) {
            return "oppo";
        }
        if (userAgent.includes("google") || userAgent.includes("android")) {
            return "google";
        }
        if (userAgent.includes("minigame")) {
            return "minigame";
        }
    }
    return "mock";
}
