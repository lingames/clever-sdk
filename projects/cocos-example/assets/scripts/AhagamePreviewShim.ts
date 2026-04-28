/**
 * 传音 h5sdk / gasdk 在部分环境会请求根目录 manifest_transsion.json、注册 sw_transsion.js。
 * Cocos 预览 (localhost:7456) 根路径无这些文件 → 404 与 SW 注册失败。
 * 在加载 adsdk 之前调用 installAhagamePreviewShims() 可减灾（非正式 SW 能力）。
 */
export function installAhagamePreviewShims(): void {
    if (typeof globalThis === "undefined") {
        return;
    }
    const w = globalThis as Record<string, unknown>;
    if (w.__cleverAhagamePreviewShim) {
        return;
    }
    w.__cleverAhagamePreviewShim = true;

    const manifestJson = JSON.stringify({
        name: "CleverDemo",
        short_name: "CleverDemo",
        start_url: "./",
        display: "browser",
    });

    if (typeof fetch !== "undefined") {
        const origFetch = fetch;
        globalThis.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
            const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
            if (url.indexOf("manifest_transsion.json") !== -1) {
                return Promise.resolve(
                    new Response(manifestJson, {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }),
                );
            }
            return origFetch.call(globalThis, input as RequestInfo, init);
        };
    }

    if (typeof navigator !== "undefined" && navigator.serviceWorker?.register) {
        const sw = navigator.serviceWorker;
        const orig = sw.register.bind(sw);
        sw.register = function (scriptURL: string | URL, options?: RegistrationOptions) {
            const s = String(scriptURL);
            if (s.indexOf("sw_transsion") !== -1) {
                console.log("[CleverDemo] 减灾：跳过 sw_transsion ServiceWorker（预览无静态脚本文件）");
                return Promise.resolve({
                    scope: "",
                    unregister: () => Promise.resolve(true),
                    update: () => Promise.resolve(undefined),
                    installing: null,
                    waiting: null,
                    active: null,
                    navigationPreload: {
                        enable: () => Promise.resolve(),
                        disable: () => Promise.resolve(),
                    },
                    addEventListener: () => {},
                    removeEventListener: () => {},
                } as unknown as ServiceWorkerRegistration);
            }
            return orig(scriptURL, options);
        };
    }

    // `<link rel="manifest" href="...manifest_transsion.json">` 由浏览器直接请求，不经过 fetch，需在插入后改为 blob URL
    if (typeof document !== "undefined" && typeof URL !== "undefined" && typeof MutationObserver !== "undefined") {
        const manifestBlobUrl = URL.createObjectURL(new Blob([manifestJson], { type: "application/json" }));
        const rewriteManifestLinks = (): void => {
            document.querySelectorAll('link[rel="manifest"]').forEach((el) => {
                const href = el.getAttribute("href") || "";
                if (href.indexOf("manifest_transsion.json") === -1) {
                    return;
                }
                if (el.getAttribute("data-clever-manifest-shim") === "1") {
                    return;
                }
                el.setAttribute("href", manifestBlobUrl);
                el.setAttribute("data-clever-manifest-shim", "1");
                console.log("[CleverDemo] 减灾：manifest link 已指向本地 blob，避免根路径 manifest 404");
            });
        };
        rewriteManifestLinks();
        new MutationObserver(() => rewriteManifestLinks()).observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    // 部分脚本用 XHR 拉 manifest
    if (typeof XMLHttpRequest !== "undefined") {
        const XO = XMLHttpRequest.prototype;
        const origOpen = XO.open;
        const origSend = XO.send;
        XO.open = function (method: string, url: string | URL, ...rest: unknown[]) {
            (this as XMLHttpRequest & { _cleverUrl?: string })._cleverUrl = String(url);
            return (origOpen as (...a: unknown[]) => void).apply(this, [method, url, ...rest]);
        };
        XO.send = function (this: XMLHttpRequest & { _cleverUrl?: string }, body?: Document | XMLHttpRequestBodyInit | null) {
            const u = this._cleverUrl || "";
            if (u.indexOf("manifest_transsion.json") !== -1) {
                queueMicrotask(() => {
                    try {
                        Object.defineProperty(this, "status", {
                            value: 200,
                            configurable: true,
                        });
                        Object.defineProperty(this, "responseText", {
                            value: manifestJson,
                            configurable: true,
                        });
                        Object.defineProperty(this, "readyState", {
                            value: 4,
                            configurable: true,
                        });
                        this.dispatchEvent(new Event("readystatechange"));
                        this.dispatchEvent(new Event("load"));
                    } catch {
                        /* ignore */
                    }
                });
                return;
            }
            return origSend.apply(this, [body as never]);
        };
    }
}
