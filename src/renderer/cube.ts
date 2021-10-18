import vertShaderCode from './shaders/cube.vert.wgsl';
import fragShaderCode from './shaders/cube.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import Binding from '../binder/binding';
import { Camera } from './camera';
import UUID from './base/objid';

// Index Buffer Data
const ELEMENTS = 10; // Vertex(4), Color(4), UV(2)

export const cubeVertexCount = 36;

// prettier-ignore
export const cubeVertexArray = new Float32Array([
    // float4 position, float4 color, float2 uv,
    1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
    -1, -1, 1, 1,  0, 0, 1, 1,  0, 1,
    -1, -1, -1, 1, 0, 0, 0, 1,  0, 0,
    1, -1, -1, 1,  1, 0, 0, 1,  1, 0,
    1, -1, 1, 1,   1, 0, 1, 1,  1, 1,
    -1, -1, -1, 1, 0, 0, 0, 1,  0, 0,

    1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
    1, -1, 1, 1,   1, 0, 1, 1,  0, 1,
    1, -1, -1, 1,  1, 0, 0, 1,  0, 0,
    1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
    1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
    1, -1, -1, 1,  1, 0, 0, 1,  0, 0,

    -1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
    1, 1, 1, 1,    1, 1, 1, 1,  0, 1,
    1, 1, -1, 1,   1, 1, 0, 1,  0, 0,
    -1, 1, -1, 1,  0, 1, 0, 1,  1, 0,
    -1, 1, 1, 1,   0, 1, 1, 1,  1, 1,
    1, 1, -1, 1,   1, 1, 0, 1,  0, 0,

    -1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
    -1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
    -1, -1, -1, 1, 0, 0, 0, 1,  1, 0,
    -1, -1, 1, 1,  0, 0, 1, 1,  1, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  0, 0,

    1, 1, 1, 1,    1, 1, 1, 1,  1, 1,
    -1, 1, 1, 1,   0, 1, 1, 1,  0, 1,
    -1, -1, 1, 1,  0, 0, 1, 1,  0, 0,
    -1, -1, 1, 1,  0, 0, 1, 1,  0, 0,
    1, -1, 1, 1,   1, 0, 1, 1,  1, 0,
    1, 1, 1, 1,    1, 1, 1, 1,  1, 1,

    1, -1, -1, 1,  1, 0, 0, 1,  1, 1,
    -1, -1, -1, 1, 0, 0, 0, 1,  0, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
    1, 1, -1, 1,   1, 1, 0, 1,  1, 0,
    1, -1, -1, 1,  1, 0, 0, 1,  1, 1,
    -1, 1, -1, 1,  0, 1, 0, 1,  0, 0,
]);

export const cubeIndexCount = 36;
export const cubeIndexArray = new Uint16Array([
    0, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29,
    30, 31, 32, 33, 34, 35,
]);

const posOffset = 0;
const colOffset = 4 * 4;
const vertexSize = 4 * ELEMENTS;

export class CubeObject extends UUID {
    private device: GPUDevice;
    private primitive: Number; // 0: point, 1: Line
    private binding: Binding;

    // Resources
    private geometryBuffer: GPUBuffer;
    private indexBuffer: GPUBuffer;
    private vertModule: GPUShaderModule;
    private fragModule: GPUShaderModule;
    private pipeline: GPURenderPipeline;

    // Uniforms 
    // - Device 
    private matrixSize = 4 * 16; // 4x4 matrix
    private offset = 256; // uniformBindGroup offset must be 256-byte aligned
    private uniformBufferSize = this.offset + this.matrixSize;
    private uniformBuffer: GPUBuffer;
    private uniformBindGroup: GPUBindGroup;

    // - Host
    private modelViewProjectionMatrix = mat4.create() as Float32Array;

    // Model
    private rotX: number;
    private rotY: number;
    private rotZ: number;

    constructor(device: GPUDevice, primitive: Number, binding: Binding) {
        super();
        
        this.device = device;
        this.primitive = primitive;
        this.binding = binding;

        this.rotX = 0.0;
        this.rotY = 0.0;
        this.rotZ = 0.0;

        this.allocate();
    }

    async allocate()
    {
        this.geometryBuffer = this.device.createBuffer({
            size: cubeVertexCount * ELEMENTS * 4,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });        
        this.device.queue.writeBuffer(this.geometryBuffer, 0, cubeVertexArray);

        let idxSize = (cubeIndexCount * 2 + 3) & ~3;
        this.indexBuffer = this.device.createBuffer({
            size: idxSize,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(this.indexBuffer, 0, cubeIndexArray);

        // Shaders
        const vsmDesc = {
            code: vertShaderCode
        };
        this.vertModule = this.device.createShaderModule(vsmDesc);

        const fsmDesc = {
            code: fragShaderCode
        };
        this.fragModule = this.device.createShaderModule(fsmDesc);
        
        // Input Assembly
        const positionAttribDesc: GPUVertexAttribute[] = [
                    {
                        shaderLocation: 0, // [[location(0)]]
                        offset: posOffset,
                        format: 'float32x4'
                    },
                    {
                        shaderLocation: 1, // [[location(1)]]
                        offset: colOffset,
                        format: 'float32x4'
                    }
                ];
        const geometryBufferDesc: GPUVertexBufferLayout = {
            attributes: positionAttribDesc,
            arrayStride: vertexSize, /* Float32Array.BYTES_PER_ELEMENT */
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
            format: 'bgra8unorm'
        };

        const fragment: GPUFragmentState = {
            module: this.fragModule,
            entryPoint: 'main',
            targets: [colorState]
        };

        // Rasterization
        const primitive: GPUPrimitiveState = {
            frontFace: 'cw',
            cullMode: 'none',
            topology: 'triangle-list' 
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            vertex,
            fragment,

            primitive,
            depthStencil
        };
        this.pipeline = this.device.createRenderPipeline(pipelineDesc);        

        // Uniform
        this.uniformBuffer = this.device.createBuffer({
            size: this.uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.uniformBindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                        offset: 0,
                        size: this.matrixSize,
                    },
                },
            ],
        });
    }

    draw = (passEncoder: GPURenderPassEncoder, camera: Camera) => {
        passEncoder.setPipeline(this.pipeline);

        // MOVE / TRANSLATE OBJECT
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0, 0, -0.1));
        // mat4.rotateX(modelMatrix, modelMatrix, this.rotY);
        // mat4.rotateY(modelMatrix, modelMatrix, this.rotY);
        // mat4.rotateZ(modelMatrix, modelMatrix, this.rotY);
        // this.rotY += 0.01;
        // if (this.rotY > 3.14)
        //     this.rotY = 0.0;

        // PROJECT ON CAMERA
        mat4.multiply(this.modelViewProjectionMatrix, camera.getCameraViewProjMatrix(), modelMatrix);
        
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.modelViewProjectionMatrix.buffer,
            this.modelViewProjectionMatrix.byteOffset,
            this.modelViewProjectionMatrix.byteLength
        );

        passEncoder.setVertexBuffer(0, this.geometryBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.setBindGroup(0, this.uniformBindGroup);
        passEncoder.drawIndexed(cubeIndexCount, 1);
    }
}
