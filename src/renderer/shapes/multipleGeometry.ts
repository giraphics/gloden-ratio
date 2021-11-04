import vertShaderCode from './shaders/geometry.vert.wgsl';
import fragShaderCode from './shaders/geometry.frag.wgsl';
import { Camera } from './../renderer/camera';
import SceneGraph from './../base/scenegraph';
import {PRIMITIVE_TYPE, TYPE_SIZE} from './../renderer/constants';

export class MultiGeometry extends SceneGraph {
    private vertexUppperLimit: number = 65536;
    private indexUppperLimit: number = 65536; // Max of index
    protected totalVertexCount: number = 0;
    protected currentIdx: number = 0;
    protected isDirty: Boolean = false;

    // Resources
    private deviceVertexBufferSize: number = 0;
    private deviceIndexBufferSize: number = 0;
    private VERTEX_BYTES_PER_ELEMENT: number = 4;
    private INDEX_BYTES_PER_ELEMENT: number = 2;
    private resizeFactor: number = 0.25;
    private scaleFactor: number = 2;

    private hostVertexBuffer: Float32Array;
    private hostIndexBuffer: Uint16Array;
    private deviceVertexBuffer: GPUBuffer;
    private indexBuffer: GPUBuffer;

    // Uniform Binding
    protected uniformBindGroup: GPUBindGroup;
    
    constructor(device: GPUDevice, primitiveType: PRIMITIVE_TYPE, vertexUppperLimit?: number) {
        // presently type info is 10 elements fixed vertex 4, color 4, uv 2
        super(primitiveType, /*typeInfo*/ [TYPE_SIZE.float32x4, TYPE_SIZE.float32x4, TYPE_SIZE.float32x2]);
        
        this.device = device;
        if (vertexUppperLimit) {
            this.vertexUppperLimit = vertexUppperLimit;
        }

        this.allocateVertexBuffersIfNeeded(this.vertexUppperLimit);
        this.allocateIndexBuffersIfNeeded(this.indexUppperLimit);
      
        this.initialize();
    }
    
    private allocateVertexBuffersIfNeeded(verterCount: number) {
        let requiredVertexSize = verterCount * this.elementCount * this.VERTEX_BYTES_PER_ELEMENT;
        if (this.deviceVertexBufferSize * this.resizeFactor <= requiredVertexSize) {
            console.log("Available Size: " + this.deviceVertexBufferSize + "Required Size: " + requiredVertexSize);
            if (this.deviceVertexBufferSize == 0) {
                this.deviceVertexBufferSize = verterCount * this.elementCount * this.VERTEX_BYTES_PER_ELEMENT;
            }

            // Scale buffer size by scaleFactor
            this.deviceVertexBufferSize *= this.scaleFactor;
            
            if (this.deviceVertexBuffer) this.deviceVertexBuffer.destroy();
            this.deviceVertexBuffer = this.device.createBuffer({
                size: this.deviceVertexBufferSize,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            });

            this.hostVertexBuffer = null;
            this.hostVertexBuffer = new Float32Array(this.deviceVertexBufferSize / this.VERTEX_BYTES_PER_ELEMENT);

            console.log("Allocating... " + this.deviceVertexBufferSize);
        }
    }

    private allocateIndexBuffersIfNeeded(indexCount: number) {
        let requiredIndexSize = ((indexCount + 3) & ~3) * this.INDEX_BYTES_PER_ELEMENT;
        if (this.deviceIndexBufferSize * this.resizeFactor <= requiredIndexSize) {
            console.log("Available index buffer size: " + this.deviceIndexBufferSize + "Required Size: " + requiredIndexSize);
            if (this.deviceIndexBufferSize == 0) {
                this.deviceIndexBufferSize = ((indexCount + 3) & ~3) * this.INDEX_BYTES_PER_ELEMENT; // Aligned to 4 bytes
            }

            // Scale buffer size by scaleFactor
            this.deviceIndexBufferSize *= this.scaleFactor;

            if (this.indexBuffer) this.indexBuffer.destroy();
            this.indexBuffer = this.device.createBuffer({
                size: this.deviceIndexBufferSize,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            });

            this.hostIndexBuffer = null;
            this.hostIndexBuffer = new Uint16Array(this.deviceIndexBufferSize / this.INDEX_BYTES_PER_ELEMENT); // this an array of 2 bytes
        }
    }

    public updateBuffers()
    {
        this.isDirty = true;
        this.allocateVertexBuffersIfNeeded(this.totalVertexCount);

        this.device.queue.writeBuffer(this.deviceVertexBuffer, 0, this.hostVertexBuffer, 0, this.totalVertexCount * this.hostVertexBuffer.BYTES_PER_ELEMENT * this.elementCount);
        this.device.queue.writeBuffer(this.indexBuffer, 0, this.hostIndexBuffer, 0, this.currentIdx * this.hostIndexBuffer.BYTES_PER_ELEMENT);
    }

    public drawGeometry(geometryVertexArray: Float32Array, indexArray: Uint16Array)
    {
        this.hostVertexBuffer.set(geometryVertexArray, this.totalVertexCount * this.elementCount);
        this.hostIndexBuffer.set(indexArray.map(x => x + this.totalVertexCount), this.currentIdx);

        this.totalVertexCount += geometryVertexArray.length / this.elementCount;
        this.currentIdx += indexArray.length;
        // console.log("---------------------------------------");
        // console.log(this.totalVertexCount * this.hostVertexBuffer.BYTES_PER_ELEMENT * this.elementCount);
        // console.log(this.vertexUppperLimit* this.hostVertexBuffer.BYTES_PER_ELEMENT * this.elementCount);
        // console.log(this.currentIdx);

        if (this.isPrimtiveTypeStrip){
            this.hostIndexBuffer[this.currentIdx] = 0xFFFF;
            this.currentIdx++;
        }
    }

    public resetIndex(): void {
        this.totalVertexCount = 0;
        this.currentIdx = 0;
    }

    public initialize()
    {
        super.initialize();

        super.createDefaultPipeline(vertShaderCode, fragShaderCode);

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

        passEncoder.setVertexBuffer(0, this.deviceVertexBuffer);
        passEncoder.setBindGroup(0, this.uniformBindGroup);
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.currentIdx, 1);
        //console.log(this.totalVertexCount);
        console.log(this.currentIdx);

        if (this.isDirty) {
            this.resetIndex();
        }
    }
}

export class StaticGeometry extends MultiGeometry {
    constructor(device: GPUDevice, primitiveType: PRIMITIVE_TYPE, vertexUppperLimit?: number) {
        super(device, primitiveType, vertexUppperLimit);
    }
}

export class DynamicGeometry extends MultiGeometry {
    constructor(device: GPUDevice, primitiveType: PRIMITIVE_TYPE, vertexUppperLimit?: number) {
        super(device, primitiveType, vertexUppperLimit);
    }
}