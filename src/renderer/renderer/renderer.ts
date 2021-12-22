import Binding from '../../binder/binding';
import { Context } from './context';
import { Scene } from './scene';
import { Camera } from './camera';

export class Renderer {
    private canvas: HTMLCanvasElement;
    public binding: Binding;
    public primitive: Number; // 0: point, 1: Line

    // API Data Structures
    private adapter: GPUAdapter;
    public device: GPUDevice;
    private queue: GPUQueue;

    // Frame Backings
    private canvasCtx: GPUCanvasContext;
    public ctx: Context;
    private colorTexture: GPUTexture;
    private colorTextureView: GPUTextureView;
    private depthTexture: GPUTexture;
    private depthTextureView: GPUTextureView;
    private sampleCount:number = 1;
    
    private commandEncoder: GPUCommandEncoder;
    private presentationFormat: GPUTextureFormat;

    constructor(canvas: HTMLCanvasElement, binding: Binding, primitive: Number) {
        this.canvas = canvas;
        this.binding = binding;
        this.primitive = primitive;
    }

    // Initialize 
    async initializeAPI(): Promise<boolean> {
        try {
            // Entry to GPU
            const entry: GPU = navigator.gpu;
            if (!entry) {
                return false;
            }

            this.ctx = new Context(this.sampleCount);
            // Physical Device Adapter
            this.adapter = await entry.requestAdapter();

            // Logical Device
            this.device = await this.adapter.requestDevice();

            // Queue
            this.queue = this.device.queue;

            this.presentationFormat = 'bgra8unorm';//this.context.getPreferredFormat(this.adapter);

            this.resizeBackings();
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }
    
    // Resize swapchain, frame buffer attachments
    resizeBackings() {
        // Swapchain
        if (!this.canvasCtx) {
            this.canvasCtx = this.canvas.getContext('webgpu');
        }

        this.canvasCtx.configure({
            device: this.device,
            format: this.presentationFormat,
            size: [this.canvas.width, this.canvas.height, 1],
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });

        if (this.colorTexture){
            this.colorTexture.destroy();
        }
        
        if (this.sampleCount > 1) {
            this.colorTexture = this.device.createTexture({
                size: [this.canvas.width, this.canvas.height, 1],
                sampleCount: this.ctx.sampleCount,
                format: this.presentationFormat,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
        }
        else {
            this.colorTexture = this.canvasCtx.getCurrentTexture();
        }

        this.colorTextureView = this.colorTexture.createView();

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.width, this.canvas.height, 1],
            sampleCount: this.ctx.sampleCount,
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        if (this.depthTexture) {
            this.depthTexture.destroy();
        }

        this.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depthTextureView = this.depthTexture.createView();
    }

    renderScene(scene: Scene, camera: Camera) {       
        for (let object of scene.getObjects()) {
            object.draw(this.ctx, camera);
        }
    }
      
    render = (scene: Scene, camera: Camera) => {
        this.resizeBackings();

        //let colorAttachment: GPURenderPassColorAttachment;
        // if (this.sampleCount > 1) {
        //     colorAttachment = {
        //         view: this.colorTextureView,
        //         resolveTarget: this.canvasCtx.getCurrentTexture().createView(),
        //         loadValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        //         storeOp: 'store'
        //     };
        // }
        // else {
        //     colorAttachment = {
        //         view: this.colorTextureView,
        //         loadValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
        //         storeOp: 'store'
        //     };
        // }

        const colorAttachment: GPURenderPassColorAttachment = (this.sampleCount > 1) ? {
            view: this.colorTextureView,
            resolveTarget: this.canvasCtx.getCurrentTexture().createView(),
            loadValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
            storeOp: 'store'
        } : {
            view: this.colorTextureView,
            loadValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
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
        this.ctx.passEncoder = this.commandEncoder.beginRenderPass(renderPassDesc);
        //console.log("Render: viewport: " + this.canvas.width + ", " + this.canvas.height);
        this.ctx.passEncoder.setViewport(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
            0,
            1
        );
        this.ctx.passEncoder.setScissorRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Write and submit commands to queue
        this.renderScene(scene, camera);

        this.ctx.passEncoder.endPass();
        this.queue.submit([this.commandEncoder.finish()]);
    };
}
