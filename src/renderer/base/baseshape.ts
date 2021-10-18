import UUID from './objid';

export default class BaseShape extends UUID {
    public device: GPUDevice;
    public vertModule: GPUShaderModule;
    public fragModule: GPUShaderModule;
    public pipeline: GPURenderPipeline;

    constructor() {
        super();
    }
}
