export class Context {
    public sampleCount:number = 1;    
    public passEncoder: GPURenderPassEncoder;

    constructor(sampleCount: number) {
        this.sampleCount = sampleCount;
    }
}
