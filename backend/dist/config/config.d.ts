interface Config {
    port: number;
    nodeEnv: string;
    dbUrl: string;
    secret: string;
    maxAge: number;
    serverHost: string;
    dockerHost: string;
}
export declare const paserNumber: (numberString: string | undefined) => number | undefined;
declare const configEnv: Config;
export default configEnv;
//# sourceMappingURL=config.d.ts.map