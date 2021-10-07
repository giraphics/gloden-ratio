import vertShaderCode from './shaders/triangle.vert.wgsl';
import fragShaderCode from './shaders/triangle.frag.wgsl';
import { mat4, vec3 } from 'gl-matrix';
import Binding from './binding';

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
export default class Renderer {
    canvas: HTMLCanvasElement;
    binding: Binding;

    // API Data Structures
    adapter: GPUAdapter;
    device: GPUDevice;
    queue: GPUQueue;

    // Frame Backings
    context: GPUCanvasContext;
    colorTexture: GPUTexture;
    colorTextureView: GPUTextureView;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;

    // Resources
    positionBuffer: GPUBuffer;
    colorBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    vertModule: GPUShaderModule;
    fragModule: GPUShaderModule;
    pipeline: GPURenderPipeline;

    commandEncoder: GPUCommandEncoder;
    passEncoder: GPURenderPassEncoder;
    speed: Float32Array;
    position: Float32Array;
    color: Float32Array;

    constructor(canvas, binding) {
        this.canvas = canvas;
        this.binding = binding;
    }

    // Start the rendering engine
    async start() {
        if (await this.initializeAPI()) {
            this.resizeBackings();
            await this.initializeResources();
            this.render();
        }
    }

    // Initialize 
    async initializeAPI(): Promise<boolean> {
        try {
            // Entry to GPU
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }

            // Physical Device Adapter
            this.adapter = await entry.requestAdapter();

            // Logical Device
            this.device = await this.adapter.requestDevice();

            // Queue
            this.queue = this.device.queue;
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    // Initialize resources to render triangle (buffers, shaders, pipeline)
    async initializeResources() {
        // Buffers
        const createBuffer = (
            arr: Float32Array | Uint16Array,
            usage: number
        ) => {
            // Align to 4 bytes (thanks @chrimsonite)
            let desc = {
                size: (arr.byteLength + 3) & ~3,
                usage,
                mappedAtCreation: true
            };
            let buffer = this.device.createBuffer(desc);
            const writeArray =
                arr instanceof Uint16Array
                    ? new Uint16Array(buffer.getMappedRange())
                    : new Float32Array(buffer.getMappedRange());
            writeArray.set(arr);
            buffer.unmap();
            return buffer;
        };

        this.position = new Float32Array(VERTEX_COUNT * ELEMENTS);
        this.positionBuffer = await this.device.createBuffer({
            size: VERTEX_COUNT * ELEMENTS * 4 /**/,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.color = new Float32Array(VERTEX_COUNT * ELEMENTS);
        this.colorBuffer = await this.device.createBuffer({
            size: VERTEX_COUNT * ELEMENTS * 4 /**/,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.speed = new Float32Array(VERTEX_COUNT * ELEMENTS);
        let off = 0;
        for (let x = 0; x < VERTEX_COUNT / 3; x++) {
            let aa = vec3.fromValues(Math.random() / 100.0, Math.random() / 100.0, 0.0);
            this.speed.set(aa, 3 * off);
            off++;
        }

        this.updatedata();

        let idxSize = (VERTEX_COUNT * 2 + 3) & ~3;
        this.indexBuffer = await this.device.createBuffer({
            size: idxSize,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        let offset = 0;
        const indices = new Uint16Array(idxSize / 2); /* Divide because 2 Uint16Array */
        for (let x = 0; x < VERTEX_COUNT; x++) {
            indices[x] = x;
        }
        this.device.queue.writeBuffer(this.indexBuffer, 0, indices);

        // Shaders
        const vsmDesc = {
            code: vertShaderCode
        };
        this.vertModule = this.device.createShaderModule(vsmDesc);

        const fsmDesc = {
            code: fragShaderCode
        };
        this.fragModule = this.device.createShaderModule(fsmDesc);

        // Graphics Pipeline

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
            topology: 'point-list'
        };

        const pipelineDesc: GPURenderPipelineDescriptor = {
            layout,

            vertex,
            fragment,

            primitive,
            depthStencil
        };
        this.pipeline = this.device.createRenderPipeline(pipelineDesc);
    }

    updatedata = () => {
        let offset = 0;
        for (let x = 0; x < VERTEX_COUNT / 3; x++) {
            let aa = vec3.fromValues(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0);
            //let aa = vec3.fromValues(Math.random(), Math.random(), 0.0);
            this.position.set(aa, 3 * offset);
            let bb = vec3.fromValues(Math.random(), Math.random(), Math.random());
            this.color.set(bb, 3 * offset);
            offset++;
        }
    }

    updatePosition = () => {
        let step = 0.001;
        for (let x = 0; x < VERTEX_COUNT; x+=3) {
            if ((this.position[x] > 1.0) || (this.position[x] < -1.0)) {
                this.speed[x] = -this.speed[x];
            }
            
            if ((this.position[x + 1] > 1.0) || (this.position[x + 1] < -1.0)) {
                this.speed[x + 1] = -this.speed[x + 1];
            }
    
            this.position[x] += this.speed[x];
            this.position[x + 1] += this.speed[x + 1];
        }
    }    

    // Resize swapchain, frame buffer attachments
    resizeBackings() {
        // Swapchain
        if (!this.context) {
            this.context = this.canvas.getContext('webgpu');
            const canvasConfig: GPUCanvasConfiguration = {
                device: this.device,
                format: 'bgra8unorm',
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
            };
            this.context.configure(canvasConfig);
        }

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.width, this.canvas.height, 1],
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        this.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();
    }

    // Write commands to send to the GPU
    encodeCommands() {
        let colorAttachment: GPURenderPassColorAttachment = {
            view: this.colorTextureView,
            loadValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: 'store'
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: this.depthTextureView,
            depthLoadValue: 1,
            depthStoreOp: 'store',
            stencilLoadValue: 'load',
            stencilStoreOp: 'store'
        };

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment
        };

        this.commandEncoder = this.device.createCommandEncoder();

        // Encode drawing commands
        this.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
        this.passEncoder.setPipeline(this.pipeline);
        this.passEncoder.setViewport(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
            0,
            1
        );
        this.passEncoder.setScissorRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        
        this.updatePosition();

        this.device.queue.writeBuffer(this.positionBuffer, 0, this.position);
        this.device.queue.writeBuffer(this.colorBuffer, 0, this.color);

        this.passEncoder.setVertexBuffer(0, this.positionBuffer);
        this.passEncoder.setVertexBuffer(1, this.colorBuffer);
        this.passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        this.passEncoder.drawIndexed(this.binding.vextexCount, 1);
        this.passEncoder.endPass();

        this.queue.submit([this.commandEncoder.finish()]);
    }
      
    render = () => {
        // Acquire next image from context
        this.colorTexture = this.context.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

        // Write and submit commands to queue
        this.encodeCommands();

        // Refresh canvas
        requestAnimationFrame(this.render);
    };
}
