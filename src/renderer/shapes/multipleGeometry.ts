import vertShaderCode from './shaders/cube.vert.wgsl';
import fragShaderCode from './shaders/cube.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import { Camera } from './../renderer/camera';
import SceneGraph from './../base/scenegraph';
import {PRIMITIVE_TYPE} from './../renderer/constants';

const posOffset = 0;
const colOffset = 4 * 4;
const ELEMENTS_PER_VERTEX = 10; // Vertex(4), Color(4), UV(2)
const vertexSize = 4 * ELEMENTS_PER_VERTEX;

export class MultiGeometry extends SceneGraph {
    private isIndexedGeometry: boolean = true;
    private geometryIndexCount: number = 0;
    private geometryVertexCount: number = 0;
    private totalVertexCount: number = 0;
    private currentIdx: number = 0;
    private geometryHostBuffer: Float32Array;
    private indexHostBuffer: Uint16Array;

    // Resources
    private geometryBuffer: GPUBuffer;
    private indexBuffer: GPUBuffer;
    
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

    constructor(device: GPUDevice, primitiveType: PRIMITIVE_TYPE, geometryVertexCount: number) {
        super(primitiveType);
        
        this.device = device;
        this.isIndexedGeometry = true;
        this.geometryVertexCount = geometryVertexCount;

        this.rotX = 0.0;
        this.rotY = 0.0;
        this.rotZ = 0.0;

        this.geometryHostBuffer = new Float32Array(this.geometryVertexCount * ELEMENTS_PER_VERTEX);
        this.geometryBuffer = this.device.createBuffer({
            size: this.geometryVertexCount * ELEMENTS_PER_VERTEX * 4,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        
        this.geometryIndexCount = this.geometryVertexCount * 2;
        let idxSize = (this.geometryIndexCount * 2 + 3) & ~3;
        this.indexHostBuffer = new Uint16Array(idxSize / 2);
        this.indexBuffer = this.device.createBuffer({
            size: idxSize,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });


        this.initialize();
    }

    public updateBuffers()
    {
        this.device.queue.writeBuffer(this.geometryBuffer, 0, this.geometryHostBuffer, 0, this.totalVertexCount * this.geometryHostBuffer.BYTES_PER_ELEMENT * ELEMENTS_PER_VERTEX);
        this.device.queue.writeBuffer(this.indexBuffer, 0, this.indexHostBuffer, 0, this.currentIdx * this.indexHostBuffer.BYTES_PER_ELEMENT); 
        // this.device.queue.writeBuffer(this.geometryBuffer, 0, this.geometryHostBuffer);
        // this.device.queue.writeBuffer(this.indexBuffer, 0, this.indexHostBuffer);
    }

    public drawGeometry(geometryVertexArray: Float32Array, indexArray: Uint16Array)
    {
        // const map2 = geometryVertexArray.map(x => x + 1);
        // this.geometryHostBuffer.set(map2, this.totalVertexCount * ELEMENTS_PER_VERTEX);
        this.geometryHostBuffer.set(geometryVertexArray, this.totalVertexCount * ELEMENTS_PER_VERTEX);

        const map1 = indexArray.map(x => x + this.totalVertexCount);
        this.indexHostBuffer.set(map1, this.currentIdx);

        this.totalVertexCount += geometryVertexArray.length / ELEMENTS_PER_VERTEX;
        this.currentIdx += indexArray.length;

        this.indexHostBuffer[this.currentIdx] = 0xFFFF;
        this.currentIdx++;
    }

    // public drawGeometryNew(geometryVertexArray: Float32Array)
    // {
    //     this.geometryHostBuffer.set(geometryVertexArray, this.totalVertexCount * ELEMENTS_PER_VERTEX);
    //     let currentVertexCount = geometryVertexArray.length / ELEMENTS_PER_VERTEX;
    //     let currentIndexCount = currentVertexCount + 1;
    //     for (let i = 0; i < currentIndexCount; i++) { // +1 for 0xFFFF
    //         this.indexHostBuffer[i + this.totalVertexCount] = i + this.totalVertexCount;

    //         if (i == currentVertexCount) { // last elemet idx
    //             this.indexHostBuffer[this.currentIdx] = 0xFFFF;
    //         }
    //     }

    //     this.totalVertexCount += currentVertexCount;
    //     this.currentIdx += currentIndexCount;
    // }

    public initialize()
    {
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
        const primitive: GPUPrimitiveState = this.isIndexedGeometry ? {
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

    public resetIndex(): void {
        this.totalVertexCount = 0;
        this.currentIdx = 0;
    }

    public draw(passEncoder: GPURenderPassEncoder, camera: Camera): void {
        // this.updateBuffers();
        // this.resetIndex();

        // draw = (passEncoder: GPURenderPassEncoder, camera: Camera) => {
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
        // this.indexHostBuffer[this.currentIdx] = 0xFFFF;
        // this.currentIdx++;
        // this.indexHostBuffer[this.currentIdx] = 0xFFFF;
        // this.currentIdx++;


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
        passEncoder.setBindGroup(0, this.uniformBindGroup);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.currentIdx, 1);
    }
}
