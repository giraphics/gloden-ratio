import UUID from './objid';
import { Camera } from './../camera';

export abstract class AbstractShape extends UUID{
//    public abstract render(frame: Frame): void;
    public abstract draw(passEncoder: GPURenderPassEncoder, camera: Camera) : void;

}

export default class BaseShape extends AbstractShape {
    public device: GPUDevice;
    public vertModule: GPUShaderModule;
    public fragModule: GPUShaderModule;
    public pipeline: GPURenderPipeline;

    constructor() {
        super();
    }
    
    public draw(passEncoder: GPURenderPassEncoder, camera: Camera): void {
    }
}
