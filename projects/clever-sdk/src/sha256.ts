export declare namespace sha256 {
    class sha256 {
        constructor(algorithm: string, inputEncoding: string, options?: { encoding: string });
        update(data: string): void;
        getHash(outputEncoding: string): string;
    }
}