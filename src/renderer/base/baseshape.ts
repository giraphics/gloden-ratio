import UUID from './objid';
import { Camera } from './../renderer/camera';
import {PRIMITIVE_TYPE} from './../renderer/constants';

export abstract class AbstractShape extends UUID{
//    public abstract render(frame: Frame): void;
    public abstract draw(passEncoder: GPURenderPassEncoder, camera: Camera) : void;

}

export default class BaseShape extends AbstractShape {
    public device: GPUDevice;
    public vertModule: GPUShaderModule;
    public fragModule: GPUShaderModule;
    public pipeline: GPURenderPipeline;
    protected primitiveType: GPUPrimitiveTopology;

    constructor(primitiveType: PRIMITIVE_TYPE) {
        super();

        switch(primitiveType) {
            case PRIMITIVE_TYPE.POINT_LIST: { 
                this.primitiveType = "point-list"; 
                break; 
            } 
            case PRIMITIVE_TYPE.LINE_LIST: { 
                this.primitiveType = "line-list"; 
               break; 
            } 
            case PRIMITIVE_TYPE.LINE_STRIP: { 
                this.primitiveType = "line-strip"; 
               break; 
            } 
            case PRIMITIVE_TYPE.TRIANGLE_LIST: { 
                this.primitiveType = "triangle-list"; 
               break; 
            }
            case PRIMITIVE_TYPE.TRIANGLE_STRIP: { 
                this.primitiveType = "triangle-strip"; 
               break; 
            } 
        }         
    }
    
    public draw(passEncoder: GPURenderPassEncoder, camera: Camera): void {
    }
}
