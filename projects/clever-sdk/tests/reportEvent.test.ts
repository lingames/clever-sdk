import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

const { mockReportEvent, mockRequest, mockCanIUse } = vi.hoisted(() => {
    (globalThis as any).TTMinis = {
        game: {
            canIUse: vi.fn().mockReturnValue(true),
            reportEvent: vi.fn(),
            request: vi.fn().mockResolvedValue({}),
        },
    };
    const mockReportEvent: Mock = vi.fn();
    const mockRequest: Mock = vi.fn();
    const mockCanIUse: Mock = vi.fn();
    return { mockReportEvent, mockRequest, mockCanIUse };
});

import { TiktokSdk } from "../src/platformMini/TiktokSdk";
import {
    TiktokGameEvent,
    TiktokEventParams,
} from "../src/models";

function getTTMinis(): any {
    return (globalThis as any).TTMinis;
}

function createMockTiktokSdk(): TiktokSdk {
    return new TiktokSdk("tiktok", "test_project", "test_game");
}

describe("TiktokSdk.reportEvent 类型推断", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const tt = getTTMinis();
        tt.game.canIUse = mockCanIUse;
        tt.game.reportEvent = mockReportEvent;
        tt.game.request = mockRequest;
        mockRequest.mockResolvedValue({});
        mockReportEvent.mockImplementation((opts: any) => opts.success?.());
        mockCanIUse.mockReturnValue(true);
    });

    it("COMPLETE_SECTION 需要 section_type 参数", () => {
        const sdk = createMockTiktokSdk();

        const validCall = () => sdk.reportEvent("level_5", {
            event_type: TiktokGameEvent.COMPLETE_SECTION,
            section_type: 0,
            main_section_no: 5,
        });

        expect(validCall).not.toThrow();
    });

    it("GainCreditsParams 类型应与 TiktokEventParams 推导一致", () => {
        type Params = TiktokEventParams<TiktokGameEvent.GAIN_CREDITS>;
        const params: Params = { value: 100, token_type: 0, token_id: "gold" };
        expect(params.value).toBe(100);
        expect(params.token_type).toBe(0);
        expect(params.token_id).toBe("gold");
    });

    it("LoadingCompleteParams 类型应与 TiktokEventParams 推导一致", () => {
        type Params = TiktokEventParams<TiktokGameEvent.LOADING_COMPLETE>;
        const params: Params = { complete_time: 1753772790000 };
        expect(params.complete_time).toBe(1753772790000);
    });

    it("向后兼容：不传 event_type 仍然接受 Record<string, any>", () => {
        const sdk = createMockTiktokSdk();

        const legacyCall = () => sdk.reportEvent("legacy_event", {
            foo: "bar",
            count: 42,
        });

        expect(legacyCall).not.toThrow();
    });

    it("向后兼容：event_type 为未知字符串仍然接受", () => {
        const sdk = createMockTiktokSdk();

        const unknownEventCall = () => sdk.reportEvent("some_event", {
            event_type: "unknown_event_type",
            data: 123,
        });

        expect(unknownEventCall).not.toThrow();
    });
});

describe("TiktokSdk.reportEvent 运行时行为", () => {
    let sdk: TiktokSdk;

    beforeEach(() => {
        vi.clearAllMocks();
        const tt = getTTMinis();
        tt.game.canIUse = mockCanIUse;
        tt.game.reportEvent = mockReportEvent;
        tt.game.request = mockRequest;
        mockRequest.mockResolvedValue({});
        mockReportEvent.mockImplementation((opts: any) => opts.success?.());
        mockCanIUse.mockReturnValue(true);
        sdk = createMockTiktokSdk();
    });

    it("已知标准事件走 TTMinis.game.reportEvent + HTTP 双通道", async () => {
        const result = await sdk.reportEvent("level_5", {
            event_type: TiktokGameEvent.COMPLETE_SECTION,
            section_type: 0,
            main_section_no: 5,
            section_name: "test",
        });

        expect(result).toBe(true);
        expect(mockReportEvent).toHaveBeenCalledTimes(1);
        expect(mockReportEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventName: "complete_section",
                params: expect.objectContaining({
                    section_type: 0,
                    main_section_no: 5,
                    section_name: "test",
                }),
            })
        );
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining("game-logger/event"),
                method: "POST",
            })
        );
    });

    it("LOADING_COMPLETE 走双通道", async () => {
        await sdk.reportEvent("game_loaded", {
            event_type: TiktokGameEvent.LOADING_COMPLETE,
            complete_time: 1753772790000,
        });

        expect(mockReportEvent).toHaveBeenCalledTimes(1);
        expect(mockReportEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventName: "loading_complete",
                params: expect.objectContaining({
                    complete_time: 1753772790000,
                }),
            })
        );
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it("GAIN_CREDITS 走双通道", async () => {
        await sdk.reportEvent("reward_earned", {
            event_type: TiktokGameEvent.GAIN_CREDITS,
            value: 500,
            token_type: 0,
            token_id: "diamond",
        });

        expect(mockReportEvent).toHaveBeenCalledTimes(1);
        expect(mockReportEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventName: "gain_credits",
                params: expect.objectContaining({
                    value: 500,
                    token_type: 0,
                    token_id: "diamond",
                }),
            })
        );
    });

    it("USER_LEAVE 走双通道", async () => {
        await sdk.reportEvent("user_exit", {
            event_type: TiktokGameEvent.USER_LEAVE,
            leave_time: Date.now(),
            leave_reason: 1,
        });

        expect(mockReportEvent).toHaveBeenCalledTimes(1);
        expect(mockReportEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                eventName: "user_leave",
                params: expect.objectContaining({
                    leave_reason: 1,
                }),
            })
        );
    });

    it("CUSTOM 事件不走 TTMinis.game.reportEvent，仅 HTTP", async () => {
        await sdk.reportEvent("custom_action", {
            event_type: TiktokGameEvent.CUSTOM,
            custom_field: "data",
        });

        expect(mockReportEvent).not.toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it("不传 event_type 仅走 HTTP", async () => {
        await sdk.reportEvent("simple_event", { level: 1, score: 100 });

        expect(mockReportEvent).not.toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    event_id: "simple_event",
                }),
            })
        );
    });

    it("canIUse 返回 false 时不调用原生 API，仅 HTTP", async () => {
        mockCanIUse.mockReturnValue(false);

        await sdk.reportEvent("level_3", {
            event_type: TiktokGameEvent.COMPLETE_SECTION,
            section_type: 0,
            main_section_no: 3,
        });

        expect(mockReportEvent).not.toHaveBeenCalled();
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it("原生 reportEvent 失败不影响 HTTP 通道", async () => {
        mockReportEvent.mockImplementation((opts: any) => opts.fail?.("error"));

        const result = await sdk.reportEvent("level_1", {
            event_type: TiktokGameEvent.COMPLETE_SECTION,
            section_type: 1,
            section_id: 101,
        });

        expect(result).toBe(true);
        expect(mockRequest).toHaveBeenCalledTimes(1);
    });
});

describe("TiktokSdk.EVENT_NAME_MAP 完整性", () => {
    it("所有 TiktokGameEvent 枚举值均在 EVENT_NAME_MAP 中", () => {
        const eventValues = Object.values(TiktokGameEvent);

        for (const event of eventValues) {
            const exists = event in (TiktokSdk as any).EVENT_NAME_MAP;
            expect(exists).toBe(true);
        }
    });

    it("已知 4 个标准事件映射非空", () => {
        const map = (TiktokSdk as any).EVENT_NAME_MAP;

        expect(map[TiktokGameEvent.LOADING_COMPLETE]).toBe("loading_complete");
        expect(map[TiktokGameEvent.COMPLETE_SECTION]).toBe("complete_section");
        expect(map[TiktokGameEvent.GAIN_CREDITS]).toBe("gain_credits");
        expect(map[TiktokGameEvent.USER_LEAVE]).toBe("user_leave");
    });

    it("CUSTOM 映射为 null", () => {
        const map = (TiktokSdk as any).EVENT_NAME_MAP;
        expect(map[TiktokGameEvent.CUSTOM]).toBeNull();
    });
});