import axios from 'axios'
import {Method} from "axios";

/**
 * 异步调用 Axios
 */
export async function callAnalyzer<I, O>(method: Method, endpoint: string, data: I): Promise<O | null> {
    // const host = process.env.VUE_APP_API_HOST
    const host = "https://api.salesagent.cc/game-analyzer";
    const bearer = 'ej'
    try {
        const response = await axios({
            method: method,
            url: `${host}/${endpoint}`,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': bearer
            },
            data: data
        })
        if (response.status !== 200) {
            console.error(response.statusText)
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

type PlayerKey = {
    player_anonymous: string
} | {
    player_id: string
}

export async function isNewPlayer(key: PlayerKey): Promise<boolean> {
    let result: boolean | null = await callAnalyzer('POST', 'player/check/new', key)
    return  result ?? false
}