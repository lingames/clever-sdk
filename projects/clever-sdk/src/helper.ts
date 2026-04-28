import sha256 from "jssha";

export function generateRandomString(length: number): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function build_sdk_head(key: string, req_body: string): any {
    const now = get_ts();

    const sign_str = key + "&POST&" + now + "&" + req_body;
    console.log("--------------get hash 111", typeof sha256);
    const sha_str = new sha256("SHA-256", "TEXT", { encoding: "UTF8" });
    console.log("--------------get hash 222");
    sha_str.update(sign_str);
    console.log("--------------get hash 333");
    const hash = sha_str.getHash("HEX");
    console.log("--------------get hash", hash);

    const headers = {
        "content-type": "application/json",
        Authorization: hash,
        "X-MARS-Timestamp": now,
    };

    return headers;
}

export function build_sdk_req(game_id: string, key: string, code: string): [string, Map<string, string>] {
    const req_body = JSON.stringify({
        game_id: game_id,
        session_id: code,
        Fields: {
            grant_type: "authorization_code",
        },
    });
    const head = build_sdk_head(key, req_body);
    return [req_body, head];
}

const get_ts = () => {
    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return unixTimestamp;
};

export function http_request(method: string, url: string, heads: Map<string, string>, body: string) {
    let xhr = new XMLHttpRequest();

    xhr.open(method, url);
    for (const [k, v] of heads) {
        xhr.setRequestHeader(k, v);
    }

    return async function () {
        return new Promise((resolve, reject) => {
            xhr.onerror = function (err) {
                reject(err);
            };

            xhr.onreadystatechange = function () {
                console.log("----------", xhr.readyState, xhr.responseText);
                if (xhr.readyState == 4) {
                    let resp = null;
                    try {
                        if (xhr.responseText && xhr.responseText != "") {
                            resp = JSON.parse(xhr.responseText);
                            resolve(resp);
                        } else {
                            reject("xml http request no response");
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
            };
            xhr.send(body);
        });
    };
}
