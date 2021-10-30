import UUID from './objid';
import { Camera } from './../renderer/camera';
import {PRIMITIVE_TYPE, TYPE_SIZE} from './../renderer/constants';
import { mat4, vec3 } from 'gl-matrix';

export abstract class AbstractShape extends UUID{
//    public abstract render(frame: Frame): void;
    public abstract draw(passEncoder: GPURenderPassEncoder, camera: Camera) : void;

}

export default class BaseShape extends AbstractShape {
    public device: GPUDevice;

    protected vertModule: GPUShaderModule;
    protected fragModule: GPUShaderModule;
    protected pipeline: GPURenderPipeline;

    protected primitiveType: GPUPrimitiveTopology;
    protected isPrimtiveTypeStrip: boolean = false;
    protected vertexSize: number = 0;
    protected elementCount: number = 0;

    // Model
    protected rotX: number = 0;
    protected rotY: number = 0;
    protected rotZ: number = 0;

    // - Host
    protected modelViewProjectionMatrix = mat4.create() as Float32Array;

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
        // MOVE / TRANSLATE OBJECT
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0, 0, -0.1));
        mat4.rotateX(modelMatrix, modelMatrix, this.rotY);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotY);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotY);
        this.rotY += 0.01;
        if (this.rotY > 3.14)
            this.rotY = 0.0;


        // PROJECT ON CAMERA
        mat4.multiply(this.modelViewProjectionMatrix, camera.getCameraViewProjMatrix(), modelMatrix);

    }
}
