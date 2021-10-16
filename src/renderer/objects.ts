import vertShaderCode from './shaders/triangle.vert.wgsl';
import fragShaderCode from './shaders/triangle.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import Binding from '../binder/binding';
import { Camera } from './camera';
import UUID from './base/objid';

const vertexShaderGLSL = `
	#version 450
    layout(location = 0) in vec4 position;
    layout(location = 1) in vec4 color;
    layout(location = 0) out vec4 vColor;
	void main() {
		gl_Position = position;
    vColor = color;
	}
`;
const fragmentShaderGLSL = `
	#version 450
    layout(location = 0) in vec4 vColor;
	layout(location = 0) out vec4 outColor;
	void main() {
		outColor = vColor;
	}
`;

// Index Buffer Data
const VERTEX_COUNT = 500000;
const ELEMENTS = 3;

export class RenderObject extends UUID {
    private device: GPUDevice;
    private primitive: Number; // 0: point, 1: Line
    private binding: Binding;

    // Resources
    private positionBuffer: GPUBuffer;
    private colorBuffer: GPUBuffer;
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

    // Camera
    //private camera: Camera;
    // Model
    private rotX: number;
    private rotY: number;
    private rotZ: number;

    private speed: Float32Array;
    private position: Float32Array;
    private color: Float32Array;

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
        this.position = new Float32Array(VERTEX_COUNT * ELEMENTS);
        this.positionBuffer = /*await*/ this.device.createBuffer({
            size: VERTEX_COUNT * ELEMENTS * 4 /**/,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });        

        this.color = new Float32Array(VERTEX_COUNT * ELEMENTS);
        this.colorBuffer = /*await*/ this.device.createBuffer({
            size: VERTEX_COUNT * ELEMENTS * 4 /**/,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.speed = new Float32Array(VERTEX_COUNT * ELEMENTS);
        let off = 0;
        for (let x = 0; x < VERTEX_COUNT / 3; x++) {
            let aa = vec3.fromValues(Math.random() / 100.0, Math.random() / 100.0, Math.random() / 100.0);
            this.speed.set(aa, 3 * off);
            off++;
        }
        let idxSize = (VERTEX_COUNT * 2 + 3) & ~3;
        this.indexBuffer = /*await*/ this.device.createBuffer({
            size: idxSize,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        const indices = new Uint16Array(idxSize / 2); /* Divide because 2 Uint16Array */
        for (let x = 0; x < VERTEX_COUNT; x++) {
            indices[x] = x;
        }
        this.device.queue.writeBuffer(this.indexBuffer, 0, indices);

        this.initializeData();

        // camera
        // this.camera = new Camera(800.0 / 600.0);
        // this.camera.z = 2;

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
        const positionAttribDesc: GPUVertexAttribute = {
            shaderLocation: 0, // [[location(0)]]
            offset: 0,
            format: 'float32x3'
        };
        const colorAttribDesc: GPUVertexAttribute = {
            shaderLocation: 1, // [[location(1)]]
            offset: 0,
            format: 'float32x3'
        };
        const positionBufferDesc: GPUVertexBufferLayout = {
            attributes: [positionAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
            stepMode: 'vertex'
        };
        const colorBufferDesc: GPUVertexBufferLayout = {
            attributes: [colorAttribDesc],
            arrayStride: 4 * 3, // sizeof(float) * 3
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
            buffers: [positionBufferDesc, colorBufferDesc]
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
            topology: this.primitive ? 'line-list' : 'point-list' 
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

    initializeData = () => {
        let offset = 0;
        for (let x = 0; x < VERTEX_COUNT / 3; x++) {
            let aa = vec3.fromValues(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0);
            this.position.set(aa, 3 * offset);
            let bb = vec3.fromValues(Math.random(), Math.random(), Math.random());
            this.color.set(bb, 3 * offset);
            offset++;
        }
    }

    update = () => {
        let step = 0.001;
        for (let x = 0; x < VERTEX_COUNT; x+=3) {
            if ((this.position[x] > 1.0) || (this.position[x] < -1.0)) {
                this.speed[x] = -this.speed[x];
            }
            
            if ((this.position[x + 1] > 1.0) || (this.position[x + 1] < -1.0)) {
                this.speed[x + 1] = -this.speed[x + 1];
            }

            if ((this.position[x + 2] > 1.0) || (this.position[x + 2] < -1.0)) {
                this.speed[x + 2] = -this.speed[x + 2];
            }
    
            this.position[x] += this.speed[x];
            this.position[x + 1] += this.speed[x + 1];
            this.position[x + 2] += this.speed[x + 2];
        }
    }

    draw = (passEncoder: GPURenderPassEncoder, camera: Camera) => {
        this.update(); // Updathis.camerathis.camerathis.camerathis.camerate the position first

        passEncoder.setPipeline(this.pipeline);

        // MOVE / TRANSLATE OBJECT
        const modelMatrix = mat4.create();
//        mat4.translate(modelMatrix, modelMatrix, vec3.fromValues(0, 0, -0.1));
        mat4.rotateX(modelMatrix, modelMatrix, this.rotY);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotY);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotY);
        this.rotY += 0.01;
        if (this.rotY > 3.14)
            this.rotY = 0.0;

        // PROJECT ON CAMERA
        mat4.multiply(this.modelViewProjectionMatrix, camera.getCameraViewProjMatrix(), modelMatrix);
        
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            this.modelViewProjectionMatrix.buffer,
            this.modelViewProjectionMatrix.byteOffset,
            this.modelViewProjectionMatrix.byteLength
        );

        this.device.queue.writeBuffer(this.positionBuffer, 0, this.position);
        this.device.queue.writeBuffer(this.colorBuffer, 0, this.color);
        passEncoder.setVertexBuffer(0, this.positionBuffer);
        passEncoder.setVertexBuffer(1, this.colorBuffer);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.setBindGroup(0, this.uniformBindGroup);
        passEncoder.drawIndexed(this.binding.vextexCount, 1);
    }
}
