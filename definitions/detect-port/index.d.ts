declare module "detect-port" {
    interface DetectPort {
        (port: number, callback: (err: Error, _port: number) => void): void;
        (port: number): Promise<number>;
    }
    const detectPort: DetectPort;
    export = detectPort;
}
