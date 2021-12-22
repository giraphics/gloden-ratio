import UUID from './objid';
import { Context } from './../renderer/context';
import { Camera } from './../renderer/camera';
import {PRIMITIVE_TYPE, TYPE_SIZE} from './../renderer/constants';
import { mat4, vec3 } from 'gl-matrix';

export abstract class AbstractShape extends UUID {
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

    protected rotation: vec3 = [0, 0, 0];
    protected translate: vec3 = [0, 0, 0];

    // - Host
    protected modelViewProjectionMatrix = mat4.create() as Float32Array;

    // Uniforms 
    // - Device 
    protected matrixSize = 4 * 16; // 4x4 matrix
    protected offset = 256; // uniformBindGroup offset must be 256-byte aligned
    protected uniformBufferSize = this.offset + this.matrixSize;
    protected uniformBuffer: GPUBuffer;
   
    private posOffset: number = 0;
    private colOffset: number = 4 * 4;

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
    
    public initialize()
    {
        // Uniform
        this.uniformBuffer = this.device.createBuffer({
            size: this.uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

    }

    public createDefaultPipeline(vertShaderCode: any, fragShaderCode: any): void {
        // Shaders
        const vsmDesc = {
            code: vertShaderCode
        };
        this.vertModule = this.device.createShaderModule(vsmDesc);

        const fsmDesc = {
            code: fragShaderCode
        };
        this.fragModule = this.device.createShaderModule(fsmDesc);
        
        // Defauft pipeline comprises of vertex4, color4, uv2
        // Input Assembly
        const positionAttribDesc: GPUVertexAttribute[] = [
                    {
                        shaderLocation: 0, // [[location(0)]]
                        offset: this.posOffset,
                        format: 'float32x4'
                    },
                    {
                        shaderLocation: 1, // [[location(1)]]
                        offset: this.colOffset,
                        format: 'float32x4'
                    }
                ];
        const geometryBufferDesc: GPUVertexBufferLayout = {
            attributes: positionAttribDesc,
            arrayStride: this.vertexSize, /* Float32Array.BYTES_PER_ELEMENT */
            stepMode: 'vertex'
        };

        // Depth
        const depthStencil: GPUDepthStencilState = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        // Uniform Data
        const pipelineLayoutDesc = { bindGroupLayouts: [] };
        const layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        // Shader Stages
        const vertex: GPUVertexState = {
            module: this.vertModule,
            entryPoint: 'main',
            buffers: [geometryBufferDesc]
        };

        // Color/Blend State
        const colorState: GPUColorTargetState = {
            format: 'bgra8unorm',
            blend: {
                color: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                },
                alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one"/*"one-minus-src-alpha"*/,
                    operation: "add"
                }
            }
        };

        const fragment: GPUFragmentState = {
            module: this.fragModule,
            entryPoint: 'main',
            targets: [colorState]
        };

        // Rasterization
        const primitive: GPUPrimitiveState = this.isPrimtiveTypeStrip ? {
            frontFace: 'cw',
            cullMode: 'none',
            topology: this.primitiveType,
            stripIndexFormat: 'uint16',  // Parminder: for triangle string this field is must
        }:
        {
            frontFace: 'cw',
            cullMode: 'none',
            topology: this.primitiveType,
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            vertex,
            fragment,

            primitive,
            multisample: {
                count: 4,
              },            depthStencil
        };
        this.pipeline = this.device.createRenderPipeline(pipelineDesc);        
    }

    public draw(passEncoder: GPURenderPassEncoder, camera: Camera): void {
        // MOVE / TRANSLATE OBJECT
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(this.translate[0], this.translate[1], this.translate[2]));
        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);
        //this.rotation[1] += 0.01;
        if (this.rotation[1] > 6.14) {
            this.rotation[1] = 0.0;
        }

        // PROJECT ON CAMERA
        mat4.multiply(this.modelViewProjectionMatrix, camera.getCameraViewProjMatrix(), modelMatrix);
    }
}
