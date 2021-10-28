import UUID from './objid';
import { Camera } from './../renderer/camera';
import {PRIMITIVE_TYPE, TYPE_SIZE} from './../renderer/constants';

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
    protected isPrimtiveTypeStrip: boolean = false;
    protected vertexSize: number = 0;
    protected elementCount: number = 0;

    constructor(primitiveType: PRIMITIVE_TYPE, typeInfo: TYPE_SIZE[]) {
        super();

        for (let i of typeInfo) {
            this.vertexSize += i;
            this.elementCount += i / Float32Array.BYTES_PER_ELEMENT;
        }
        console.log(this.vertexSize);
        console.log(this.elementCount);
    
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
        this.isPrimtiveTypeStrip = (primitiveType > PRIMITIVE_TYPE.TRIANGLE_LIST);
    }
    
    public draw(passEncoder: GPURenderPassEncoder, camera: Camera): void {
    }
}
