import {MySdk} from "../MySdk";


type KuaiShouInitialize = {}

export class KuaiShouSdk extends MySdk {
    async initialize(config: KuaiShouInitialize): Promise<boolean> {
        return true
    }
}