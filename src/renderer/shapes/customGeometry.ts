import vertShaderCode from './shaders/cube.vert.wgsl';
import fragShaderCode from './shaders/cube.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
//import Binding from '../../binder/binding';
import { Camera } from './../renderer/camera';
import SceneGraph from './../base/scenegraph';
import {PRIMITIVE_TYPE} from './../renderer/constants';

//export const geometryVertexCount = 8;

// https://en.wikipedia.org/wiki/Triangle_strip
export const geometry1 = new Float32Array([
    // float4 position, float4 color, float2 uv,
    -1, 1, -1, 1,   1, 0, 1, 1,  1, 1,  // -> 4
    -1, 1, 1, 1,  0, 0, 1, 1,  0, 1,  // -> 5
    1, 1, -1, 1, 0, 0, 0, 1,  0, 0,  // -> 6
    1, 1, 1, 1,  1, 0, 0, 1,  1, 0,  // -> 7
]);

export const geometry2 = new Float32Array([
    // float4 position, float4 color, float2 uv,
    -1, -1, -1, 1,   1, 0, 1, 1,  1, 1, // -> 0
    -1, -1, 1, 1,  0, 0, 1, 1,  0, 1, // -> 1
    1, -1, -1, 1, 0, 0, 0, 1,  0, 0, // -> 2
    1, -1, 1, 1,  1, 0, 0, 1,  1, 0, // -> 3
]);
 
const posOffset = 0;
const colOffset = 4 * 4;
const ELEMENTS = 10; // Vertex(4), Color(4), UV(2)
const vertexSize = 4 * ELEMENTS;

export class CustomGeometry extends SceneGraph {
    private isIndexedGeometry: boolean = false;
    private geometryIndexCount: number = 16;
    private geometryVertexCount: number = 16;

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

    constructor(device: GPUDevice, primitive: Number, primitiveType: PRIMITIVE_TYPE, isIndexedGeometry: boolean) {
        super(primitiveType);
        
        this.device = device;
        this.isIndexedGeometry = isIndexedGeometry;

        this.initialize();
    }

    public allocate(geometryVertexArray: Float32Array, geometryIndexArray?: Uint16Array)
    {
        this.geometryVertexCount = geometryVertexArray.length;
        this.geometryBuffer = this.device.createBuffer({
            size: this.geometryVertexCount * ELEMENTS * 4,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(this.geometryBuffer, 0, geometryVertexArray);

        // Please check if this is correct way to unallocate
        geometryVertexArray = null;
        console.log(geometryVertexArray);

        if (geometryIndexArray) {
            if (!this.isIndexedGeometry) {
                console.log("Custom Geometry class is not expecting index buffer however it is provided with.");
            }
            this.geometryIndexCount = geometryIndexArray.length;
            let idxSize = (this.geometryIndexCount * 2 + 3) & ~3;
            this.indexBuffer = this.device.createBuffer({
                size: idxSize,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            });

            this.device.queue.writeBuffer(this.indexBuffer, 0, geometryIndexArray);
        }
    }

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

    public draw(passEncoder: GPURenderPassEncoder, camera: Camera): void {
        super.draw(passEncoder, camera);
        passEncoder.setPipeline(this.pipeline);
        
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.modelViewProjectionMatrix.buffer,
            this.modelViewProjectionMatrix.byteOffset,
            this.modelViewProjectionMatrix.byteLength
        );

        passEncoder.setVertexBuffer(0, this.geometryBuffer);
        passEncoder.setBindGroup(0, this.uniformBindGroup);
        if (this.isIndexedGeometry)
        {
            passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
            passEncoder.drawIndexed(this.geometryIndexCount, 1);
        }
        else
        {
            passEncoder.draw(this.geometryVertexCount, 1, 0, 0);
        }
    }
}
