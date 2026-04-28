import {
    _decorator,
    Color,
    Component,
    director,
    Enum,
    EventTouch,
    Graphics,
    Input,
    Label,
    Node,
    UITransform,
    UIOpacity,
    Vec3,
    Widget,
    input,
} from "cc";
import { createSdk } from "@lingames/clever-sdk";
import { installAhagamePreviewShims } from "./AhagamePreviewShim";
import { bindCleverSdk, getCleverSdk } from "./CleverSdkGlobals";

const { ccclass, property } = _decorator;

/** 演示平台：仅 Ahagame 会加载传音 h5sdk，激励才有真实播放流程 */
enum CleverDemoPlatform {
    Mock = 0,
    Ahagame = 1,
}

/** createSdk 入参（与 clever-sdk 的 DynamicSdkConfig 一致；主包未导出该类型名，故用 Parameters 推断） */
type CleverSdkCreateConfig = Parameters<typeof createSdk>[0];

/**
 * CleverSdk2D：挂在 Canvas；演示按钮在 onLoad/start 延后一帧创建。
 * SDK：默认在 onLoad 里 `createSdk` + `bindCleverSdk`；若关闭 `autoInjectCleverSdk` 则需自行调用
 * `bindCleverSdk` / `SdkManager.bind`。
 *
 * 说明：编辑器里 Scene 面板出现的 `[Scene]`、`wasm` 等多为引擎/场景视图日志；
 * 游戏脚本的 `console.log` 只在「预览/构建运行」时出现，且浏览器预览时往往在 Chrome 开发者工具 Console。
 */
@ccclass("UIController")
export class UIController extends Component {
    @property({ tooltip: "运行时自动生成四个演示按钮" })
    autoCreateDemoButtons = true;

    @property({
        tooltip: "在画面底部显示一行字，用于确认游戏脚本已执行（不依赖控制台是否显示 TS 日志）",
    })
    showRuntimeDebugOnScreen = true;

    @property({
        tooltip: "为 true 时在 onLoad 内 createSdk 并注入 CleverSdkGlobals（默认 mock，传音选 ahagame）",
    })
    autoInjectCleverSdk = true;

    @property({
        type: Enum(CleverDemoPlatform),
        tooltip: "Mock：不调真实广告。Ahagame：加载 h5sdk（默认已填示例参数，与仓库 game/index.html 一致）。",
    })
    cleverDemoPlatform = CleverDemoPlatform.Ahagame;

    @property({
        tooltip: "传音应用 App Key（与官方壳示例一致时可保留 5024356）",
    })
    ahagameAppKey = "5024356";

    @property({
        tooltip: "AdSense client（与 game/index.html 壳一致；可改为自家 ca-pub）",
    })
    ahagameAdSenseId = "ca-pub-3665476663852390";

    @property({ tooltip: "可选：data-ad-channel，示例壳为 4020426666" })
    ahagameAdChannel = "4020426666";

    @property({ tooltip: "可选：GA4 测量 ID，示例壳为 G-LKJ6NGTQBF" })
    ahagameGaId = "G-LKJ6NGTQBF";

    @property({
        tooltip: "联调时开启 data-adbreak-test（测试广告）；上线务必取消勾选",
    })
    ahagameAdBreakTest = true;

    /** 与 `ensureCleverSdkInjected` 同源：按钮须在注入结束后再 `getCleverSdk`，否则会误报「未注入」。 */
    private _cleverSdkInjectPromise: Promise<void> = Promise.resolve();

    /** 演示按钮命中区（用全局 input + UITransform.hitTest，避免节点级触摸未派发） */
    private readonly _demoButtonHits: {
        tf: UITransform;
        nodeName: string;
        text: string;
        onClick: () => void;
    }[] = [];

    onLoad() {
        // 须在 createSdk 加载 adsdk 之前执行，减轻预览域名下 manifest/SW 404 与未捕获 Promise
        installAhagamePreviewShims();
        // 单行输出：须在游戏「预览/运行」里看；与 Scene 面板里 [Scene] 引擎日志不是同一通道。
        console.log(
            `[CleverDemo] UIController.onLoad node=${this.node.name} scene=${director.getScene()?.name ?? "(none)"} autoCreateDemoButtons=${this.autoCreateDemoButtons}`,
        );
        console.warn("[CleverDemo] UIController.onLoad（warn 便于在 Creator 里过滤 Log 时仍可见）");
        if (this.autoInjectCleverSdk) {
            this._cleverSdkInjectPromise = this.ensureCleverSdkInjected();
        }
        if (this.showRuntimeDebugOnScreen) {
            this.ensureRuntimeDebugBanner();
        }
        this.scheduleDemoUiBuild();
    }

    /** 未外部注入时，按编辑器选项创建并绑定 SDK（默认 mock，无需宿主）。 */
    private async ensureCleverSdkInjected(): Promise<void> {
        if (!this.autoInjectCleverSdk) {
            return;
        }
        if (getCleverSdk()) {
            return;
        }
        const config = this.buildCleverDemoSdkConfig();
        try {
            const sdk = await createSdk(config);
            bindCleverSdk(sdk);
            if (this.cleverDemoPlatform === CleverDemoPlatform.Mock) {
                console.warn(
                    "[CleverDemo] 当前为 Mock：激励立即返回，无广告画面。要看真实流程请在 UIController 将「演示平台」改为 Ahagame 并填写 ahagameAppKey 后重新运行预览。",
                );
            } else {
                const key = (this.ahagameAppKey || "").trim();
                if (!key) {
                    console.warn("[CleverDemo] 已选 Ahagame 但 ahagameAppKey 为空：请到 Dlightek/传音后台取应用 App Key 填入后再试。");
                } else {
                    console.log(
                        "[CleverDemo] 已注入 AhagameSdk；可点「传音广告 / SDK测试」。若无广告请查控制台网络是否加载 hippoobox adsdk、及 AdSense 区域策略。",
                    );
                }
            }
        } catch (e) {
            console.warn("[CleverDemo] createSdk 失败，按钮将提示未注入 cleverSdk", e);
        }
    }

    private async waitForCleverSdkInjected(): Promise<void> {
        await this._cleverSdkInjectPromise;
    }

    private buildCleverDemoSdkConfig(): CleverSdkCreateConfig {
        const base: CleverSdkCreateConfig = {
            project_id: "clever_demo",
            sdk_login_url: "",
            game_id: "demo_game",
        };
        if (this.cleverDemoPlatform === CleverDemoPlatform.Ahagame) {
            const testPublisher = "ca-pub-3940256099942544";
            return {
                ...base,
                platform: "ahagame",
                adSenseId: (this.ahagameAdSenseId || testPublisher).trim(),
                appKey: (this.ahagameAppKey || "").trim(),
                gaId: (this.ahagameGaId || "").trim(),
                adChannel: (this.ahagameAdChannel || "").trim(),
                adBreakTest: this.ahagameAdBreakTest,
            } as CleverSdkCreateConfig;
        }
        return { ...base, platform: "mock" };
    }

    onEnable(): void {
        input.on(Input.EventType.TOUCH_END, this.onGlobalTouchEnd, this);
    }

    onDisable(): void {
        input.off(Input.EventType.TOUCH_END, this.onGlobalTouchEnd, this);
    }

    start() {
        this.scheduleDemoUiBuild();
    }

    private scheduleDemoUiBuild() {
        const allowAuto = this.autoCreateDemoButtons === undefined || this.autoCreateDemoButtons === true;
        if (!allowAuto) {
            return;
        }
        if (this.node.getChildByName("CleverSdkDemoButtons")) {
            return;
        }
        this.scheduleOnce(() => {
            if (!this.isValid || !this.node.isValid) {
                return;
            }
            if (this.node.getChildByName("CleverSdkDemoButtons")) {
                return;
            }
            console.log("[CleverDemo] UIController 构建演示 UI，当前场景:", director.getScene()?.name);
            this.setupDemoButtons();
        }, 0);
    }

    public onPlayRewardedVideo() {
        void (async () => {
            await this.waitForCleverSdkInjected();
            console.log("[CleverDemo] playRewardedVideo");
            const s = getCleverSdk();
            if (s) {
                s.playRewardedVideo({
                    wxUnitId: "adunit-dd09002f9d38454f",
                    ttUnitId: "d7g9e4b4kh1h95be6k",
                    adUnitId: "",
                });
            } else {
                console.warn('[CleverDemo] 未注入 cleverSdk（请 import { bindCleverSdk } from "./CleverSdkGlobals"）');
            }
        })();
    }

    public onCreateBannerAd() {
        void (async () => {
            await this.waitForCleverSdkInjected();
            console.log("[CleverDemo] createBannerAd");
            const s = getCleverSdk();
            if (s) {
                s.createBannerAd({ adUnitId: "" });
            } else {
                console.warn("[CleverDemo] 未注入 cleverSdk");
            }
        })();
    }

    public onCreateNativeAd() {
        void (async () => {
            await this.waitForCleverSdkInjected();
            console.log("[CleverDemo] createNativeAd");
            const s = getCleverSdk();
            if (s) {
                s.createNativeAd({ adUnitId: "" });
            } else {
                console.warn("[CleverDemo] 未注入 cleverSdk");
            }
        })();
    }

    public onTestLogin() {
        void (async () => {
            await this.waitForCleverSdkInjected();
            console.log("[CleverDemo] testLogin");
            const s = getCleverSdk();
            if (!s) {
                console.warn("[CleverDemo] 未注入 cleverSdk");
                return;
            }
            const player = await s.login();
            const openId =
                player && typeof player === "object" && "open_id" in player ? String((player as { open_id?: string }).open_id ?? "") : "";
            s.reportContext({ player_anonymous: openId });
        })();
    }

    /**
     * 传音 / Dlightek（clever-sdk 内为 AhagameSdk）：走 h5sdk.adBreak({ type: "reward", name })。
     * 浏览器联调测试广告：createSdk 需 `platform: "ahagame"`，并在 initialize 里配置
     * `adSenseId`（常用 Google 测试发布商 ca-pub-3940256099942544）与后台下发的 `appKey`。
     * @see https://dev.dlightek.com/docs?id=36
     */
    public onTranssionAd() {
        void (async () => {
            await this.waitForCleverSdkInjected();
            console.log("[CleverDemo] transsionAd 传音广告 → playRewardedVideo");
            if (this.cleverDemoPlatform === CleverDemoPlatform.Mock) {
                console.warn(
                    "[CleverDemo] 当前为 Mock：不会加载传音 h5sdk，「立即结束」是预期行为。要看广告：演示平台选 Ahagame + 填 ahagameAppKey，保存后重新预览。",
                );
            }
            const s = getCleverSdk();
            if (!s) {
                console.warn("[CleverDemo] 未注入 cleverSdk");
                return;
            }
            try {
                const reward = await s.playRewardedVideo({
                    adUnitId: "",
                    name: "transsion_reward_test",
                });
                console.log("[CleverDemo] 传音激励结束", reward);
            } catch (e) {
                console.warn("[CleverDemo] 传音广告异常", e);
            }
        })();
    }

    /**
     * 原「传音登录」改为 SDK 测试：与「传音广告」相同，走 `playRewardedVideo`。
     * 要看到真实广告：UIController「演示平台」选 Ahagame，填写 `ahagameAppKey`，保存场景后重新预览。
     */
    public onSdkTest() {
        console.log("[CleverDemo] SDK测试 → playRewardedVideo（与传音广告同一路径）");
        this.onTranssionAd();
    }

    private setupDemoButtons() {
        if (this.node.getChildByName("CleverSdkDemoButtons")) {
            return;
        }
        console.log("[CleverDemo] 创建演示 UI（Graphics + Label）");
        console.warn("[CleverDemo] 创建演示 UI（同上，仅预览/运行时输出）");
        this.buildGraphicsDemoUi();
    }

    /** 画面内证明 onLoad 已跑；仅编辑场景不跑脚本时不会出现此行。 */
    private ensureRuntimeDebugBanner(): void {
        const bannerName = "CleverRuntimeDebugBanner";
        if (this.node.getChildByName(bannerName)) {
            return;
        }
        const uiLayer = this.node.layer;
        const n = new Node(bannerName);
        n.layer = uiLayer;
        n.setParent(this.node);
        n.setSiblingIndex(this.node.children.length - 1);

        const tf = n.addComponent(UITransform);
        tf.setContentSize(920, 72);
        const w = n.addComponent(Widget);
        w.isAlignBottom = true;
        w.isAlignHorizontalCenter = true;
        w.bottom = 12;
        w.horizontalCenter = 0;
        w.alignMode = 2;

        const lab = n.addComponent(Label);
        lab.string = "脚本已执行：UIController.onLoad（若能看到本行=游戏在跑；Scene 里 [Scene]/wasm 是引擎日志，不是 TS 的 console）";
        lab.fontSize = 15;
        lab.lineHeight = 20;
        lab.color = new Color(255, 230, 120, 255);
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
        const lf = lab as Label & { useSystemFont?: boolean };
        if (typeof lf.useSystemFont === "boolean") {
            lf.useSystemFont = true;
        }
    }

    private buildGraphicsDemoUi() {
        this._demoButtonHits.length = 0;
        const uiLayer = this.node.layer;

        const root = new Node("CleverSdkDemoButtons");
        root.layer = uiLayer;
        root.setParent(this.node);
        root.setSiblingIndex(this.node.children.length - 1);

        const rootTf = root.addComponent(UITransform);
        rootTf.setContentSize(960, 460);
        root.setPosition(new Vec3(0, 0, 0));
        root.addComponent(UIOpacity).opacity = 255;
        const rootWidget = root.addComponent(Widget);
        rootWidget.isAlignHorizontalCenter = true;
        rootWidget.isAlignVerticalCenter = true;

        const title = new Node("DemoTitle");
        title.layer = uiLayer;
        title.setParent(root);
        const ttf = title.addComponent(UITransform);
        ttf.setContentSize(900, 80);
        title.setPosition(new Vec3(0, 188, 0));
        const tlab = title.addComponent(Label);
        tlab.string = "Clever SDK 演示\n（未注入 SDK 时按钮仅打日志）";
        tlab.fontSize = 22;
        tlab.lineHeight = 28;
        tlab.color = Color.WHITE;
        tlab.horizontalAlign = Label.HorizontalAlign.CENTER;
        tlab.verticalAlign = Label.VerticalAlign.CENTER;
        const tlf = tlab as Label & { useSystemFont?: boolean };
        if (typeof tlf.useSystemFont === "boolean") {
            tlf.useSystemFont = true;
        }

        const leftSpecs: {
            name: string;
            label: string;
            onClick: () => void;
        }[] = [
            {
                name: "PlayRewardedVideoButton",
                label: "激励视频",
                onClick: () => this.onPlayRewardedVideo(),
            },
            {
                name: "CreateBannerAdButton",
                label: "横幅广告",
                onClick: () => this.onCreateBannerAd(),
            },
            {
                name: "CreateNativeAdButton",
                label: "原生广告",
                onClick: () => this.onCreateNativeAd(),
            },
            {
                name: "TestLoginButton",
                label: "测试登录",
                onClick: () => this.onTestLogin(),
            },
        ];

        const rightSpecs: {
            name: string;
            label: string;
            onClick: () => void;
        }[] = [
            {
                name: "TranssionAdButton",
                label: "传音广告",
                onClick: () => this.onTranssionAd(),
            },
            {
                name: "SdkTestButton",
                label: "SDK测试",
                onClick: () => this.onSdkTest(),
            },
        ];

        const leftX = -248;
        let yL = 96;
        for (const s of leftSpecs) {
            const btn = this.makeGraphicsButton(s.name, s.label, uiLayer, () => s.onClick());
            btn.setParent(root);
            btn.setPosition(new Vec3(leftX, yL, 0));
            yL -= 76;
            const tf = btn.getComponent(UITransform);
            if (tf) {
                this._demoButtonHits.push({
                    tf,
                    nodeName: s.name,
                    text: s.label,
                    onClick: () => s.onClick(),
                });
            }
        }

        const rightX = 248;
        let yR = 58;
        for (const s of rightSpecs) {
            const btn = this.makeGraphicsButton(s.name, s.label, uiLayer, () => s.onClick());
            btn.setParent(root);
            btn.setPosition(new Vec3(rightX, yR, 0));
            yR -= 76;
            const tf = btn.getComponent(UITransform);
            if (tf) {
                this._demoButtonHits.push({
                    tf,
                    nodeName: s.name,
                    text: s.label,
                    onClick: () => s.onClick(),
                });
            }
        }
    }

    private makeGraphicsButton(nodeName: string, text: string, uiLayer: number, onClick: () => void): Node {
        const n = new Node(nodeName);
        n.layer = uiLayer;
        n.addComponent(UIOpacity).opacity = 255;

        const tf = n.addComponent(UITransform);
        tf.setContentSize(320, 60);

        const g = n.addComponent(Graphics);
        g.fillColor = new Color(37, 99, 235, 255);
        g.rect(-160, -30, 320, 60);
        g.fill();
        g.enabled = true;

        const labNd = new Node("Txt");
        labNd.layer = uiLayer;
        labNd.setParent(n);
        const ltf = labNd.addComponent(UITransform);
        ltf.setContentSize(320, 60);
        labNd.setPosition(Vec3.ZERO);
        const lab = labNd.addComponent(Label);
        lab.string = text;
        lab.fontSize = 24;
        lab.lineHeight = 28;
        lab.color = Color.WHITE;
        lab.horizontalAlign = Label.HorizontalAlign.CENTER;
        lab.verticalAlign = Label.VerticalAlign.CENTER;
        const lf = lab as Label & { useSystemFont?: boolean };
        if (typeof lf.useSystemFont === "boolean") {
            lf.useSystemFont = true;
        }

        return n;
    }

    /** 与引擎 Button 一致：用屏幕坐标 hitTest（见 cocos Button._onTouchMove） */
    private onGlobalTouchEnd = (event: EventTouch): void => {
        const touch = event.touch;
        if (!touch || this._demoButtonHits.length === 0) {
            return;
        }
        const loc = touch.getLocation();
        const wid = event.windowId ?? 0;
        for (let i = this._demoButtonHits.length - 1; i >= 0; i--) {
            const row = this._demoButtonHits[i];
            if (!row.tf.node.isValid || !row.tf.enabled) {
                continue;
            }
            if (row.tf.hitTest(loc, wid)) {
                console.log("[CleverDemo] 按钮点击", `name=${row.nodeName}`, `label=${row.text}`);
                row.onClick();
                break;
            }
        }
    };
}
