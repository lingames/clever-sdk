export interface DouyinAdvertiseAttribution {
    advertise_id?: string;
    clickid: string;
    project_id?: string;
    promotion_id?: string;
    creativetype?: string;
    requestid?: string;
}

function toRecord(value: unknown): Record<string, any> {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, any>;
    }
    if (typeof value === "string" && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
                return parsed;
        } catch {
            return Object.fromEntries(new URLSearchParams(value));
        }
    }
    return {};
}

function firstString(...values: unknown[]): string {
    for (const value of values) {
        if (value !== undefined && value !== null && String(value).trim())
            return String(value).trim();
    }
    return "";
}

/**
 * Extract OceanEngine attribution from Douyin mini-game launch options.
 * Different runtime versions expose the payload as ad_params, adParams,
 * query object, or query string, so all documented shapes are accepted.
 */
export function extractDouyinAdvertiseAttribution(
    launchOptions: unknown,
): DouyinAdvertiseAttribution | null {
    const root = toRecord(launchOptions);
    const query = toRecord(root.query);
    const adParams = {
        ...toRecord(root.ad_params),
        ...toRecord(root.adParams),
        ...toRecord(query.ad_params),
        ...toRecord(query.adParams),
    };

    const clickid = firstString(
        adParams.clickid,
        adParams.click_id,
        query.clickid,
        query.click_id,
        root.clickid,
    );
    if (!clickid || /^__[A-Z0-9_]+__$/.test(clickid)) return null;

    return {
        advertise_id:
            firstString(query.advertise_id, root.advertise_id) || undefined,
        clickid,
        project_id:
            firstString(
                adParams.project_id,
                query.project_id,
                root.project_id,
            ) || undefined,
        promotion_id:
            firstString(
                adParams.promotion_id,
                query.promotion_id,
                root.promotion_id,
            ) || undefined,
        creativetype:
            firstString(
                adParams.creativetype,
                query.creativetype,
                root.creativetype,
            ) || undefined,
        requestid:
            firstString(adParams.requestid, query.requestid, root.requestid) ||
            undefined,
    };
}
