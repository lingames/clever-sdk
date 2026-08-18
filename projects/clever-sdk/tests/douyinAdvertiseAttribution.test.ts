import { describe, expect, it } from "vitest";
import { extractDouyinAdvertiseAttribution } from "../src/models/DouyinAdvertiseAttribution";

describe("Douyin mini-game advertise attribution", () => {
    it("extracts clickid from ad_params", () => {
        expect(
            extractDouyinAdvertiseAttribution({
                ad_params: {
                    clickid: "real-click-id",
                    project_id: "ocean-project",
                    promotion_id: "promotion-1",
                    creativetype: "video",
                    requestid: "request-1",
                },
                query: { advertise_id: "1785202342208" },
            }),
        ).toEqual({
            advertise_id: "1785202342208",
            clickid: "real-click-id",
            project_id: "ocean-project",
            promotion_id: "promotion-1",
            creativetype: "video",
            requestid: "request-1",
        });
    });

    it("supports query-string launch options", () => {
        expect(
            extractDouyinAdvertiseAttribution({
                query: "advertise_id=123&clickid=query-click&promotion_id=promotion-2",
            }),
        ).toMatchObject({
            advertise_id: "123",
            clickid: "query-click",
            promotion_id: "promotion-2",
        });
    });

    it("rejects missing and unresolved click macros", () => {
        expect(extractDouyinAdvertiseAttribution({ query: {} })).toBeNull();
        expect(
            extractDouyinAdvertiseAttribution({
                query: { clickid: "__CLICKID__" },
            }),
        ).toBeNull();
    });
});
