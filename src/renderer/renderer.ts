import Binding from '../binder/binding';
import { RenderObject } from './objects';
import { Scene } from './scene';

export default class Renderer {
    private canvas: HTMLCanvasElement;
    private binding: Binding;
    private primitive: Number; // 0: point, 1: Line

    // API Data Structures
    private adapter: GPUAdapter;
    private device: GPUDevice;
    private queue: GPUQueue;

    // Frame Backings
    private context: GPUCanvasContext;
    private colorTexture: GPUTexture;
    private colorTextureView: GPUTextureView;
    private depthTexture: GPUTexture;
    private depthTextureView: GPUTextureView;
    
    private commandEncoder: GPUCommandEncoder;
    private passEncoder: GPURenderPassEncoder;

    // Render objects OR scene goes here
    private object: RenderObject;
    private scene: Scene;

    constructor(canvas: HTMLCanvasElement, binding: Binding, primitive: Number) {
        this.canvas = canvas;
        this.binding = binding;
        this.primitive = primitive;
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
            this.scene = new Scene();
            this.scene.add(new RenderObject(this.device, this.primitive, this.binding));
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

    // Initialize resources to render triangle (buffers, shaders, pipeline)
    async initializeResources() {
        for (let object of this.scene.getObjects()) {
            object.allocate();
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

    renderScene() {       
        // Todo do it for each
        //this.object.draw(this.passEncoder);
        for (let object of this.scene.getObjects()) {
            object.draw(this.passEncoder);
        }
    }
      
    render = () => {
        // Acquire next image from context
        this.colorTexture = this.context.getCurrentTexture();
        this.colorTextureView = this.colorTexture.createView();

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
 
        // Write and submit commands to queue
        this.renderScene();

        this.passEncoder.endPass();
        this.queue.submit([this.commandEncoder.finish()]);

        // Refresh canvas
        requestAnimationFrame(this.render);
    };
}
