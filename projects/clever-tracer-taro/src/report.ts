import {OnEvent} from "./models/on-event";
import Taro from "@tarojs/taro";
import {getToken} from "./access_tokens";

export async function callLogger<T>(method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE', endpoint: string, data: any): Promise<T | null> {
    const host = 'https://api.salesagent.cc/game-logger';
    const token = await getToken();
    if (token == null) {
        return null
    }
    let headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': token
    }
    try {
        const response = await Taro.request({
            method: method,
            url: `${host}/${endpoint}`,
            header: headers,
            data: data
        })
        if (response.statusCode !== 200) {
            console.error(response.errMsg)
            return null
        }
        const result = response.data
        if (result.code < 0) {
            console.error(result.message)
            return null
        } else {
            return result.data
        }
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function reportEvent(data: OnEvent): Promise<boolean> {
    return await callLogger('POST', 'event', data) || false;
}

