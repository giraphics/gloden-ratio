export class Context {
    private _lastWidth:number = -1;
    private _lastHeight:number = -1;

    public sampleCount:number = 1;    
    public passEncoder: GPURenderPassEncoder;

    constructor(sampleCount: number) {
        this.sampleCount = sampleCount;
    }

    get lastWidth() {
        return this._lastWidth;
    }

    set lastWidth(value: number) {
        this._lastWidth = value;
    }

    get lastHeight() {
        return this._lastHeight;
    }

    set lastHeight(value: number) {
        this._lastHeight = value;
    }
}
