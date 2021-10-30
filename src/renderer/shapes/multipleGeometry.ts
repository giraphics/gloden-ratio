import vertShaderCode from './shaders/cube.vert.wgsl';
import fragShaderCode from './shaders/cube.frag.wgsl';
import { Camera } from './../renderer/camera';
import SceneGraph from './../base/scenegraph';
import {PRIMITIVE_TYPE, TYPE_SIZE} from './../renderer/constants';

export class MultiGeometry extends SceneGraph {
    private geometryIndexCount: number = 0;
    private vertexUppperLimit: number = 65536; // Max of index
    private totalVertexCount: number = 0;
    private currentIdx: number = 0;
    private geometryHostBuffer: Float32Array;
    private indexHostBuffer: Uint16Array;

    // Resources
    private geometryBuffer: GPUBuffer;
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

        this.geometryHostBuffer = new Float32Array(this.vertexUppperLimit * this.elementCount);
        this.geometryBuffer = this.device.createBuffer({
            size: this.vertexUppperLimit * this.elementCount * this.geometryHostBuffer.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        
        this.geometryIndexCount = this.vertexUppperLimit * 2;
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
        // console.log("---------------------------------------");
        // console.log(this.totalVertexCount * this.geometryHostBuffer.BYTES_PER_ELEMENT * this.elementCount);
        // console.log(this.vertexUppperLimit* this.geometryHostBuffer.BYTES_PER_ELEMENT * this.elementCount);
        console.log(this.currentIdx);

        this.device.queue.writeBuffer(this.geometryBuffer, 0, this.geometryHostBuffer, 0, this.totalVertexCount * this.geometryHostBuffer.BYTES_PER_ELEMENT * this.elementCount);
        this.device.queue.writeBuffer(this.indexBuffer, 0, this.indexHostBuffer, 0, this.currentIdx * this.indexHostBuffer.BYTES_PER_ELEMENT); 
    }

    public drawGeometry(geometryVertexArray: Float32Array, indexArray: Uint16Array)
    {
        this.geometryHostBuffer.set(geometryVertexArray, this.totalVertexCount * this.elementCount);
        this.indexHostBuffer.set(indexArray.map(x => x + this.totalVertexCount), this.currentIdx);

        this.totalVertexCount += geometryVertexArray.length / this.elementCount;
        this.currentIdx += indexArray.length;
        // console.log("---------------------------------------");
        // console.log(this.totalVertexCount * this.geometryHostBuffer.BYTES_PER_ELEMENT * this.elementCount);
        // console.log(this.vertexUppperLimit* this.geometryHostBuffer.BYTES_PER_ELEMENT * this.elementCount);
        // console.log(this.totalVertexCount);
        // console.log(this.currentIdx);

        if (this.isPrimtiveTypeStrip){
            this.indexHostBuffer[this.currentIdx] = 0xFFFF;
            this.currentIdx++;
        }
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

    public resetIndex(): void {
        this.totalVertexCount = 0;
        this.currentIdx = 0;
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
        passEncoder.setIndexBuffer(this.indexBuffer, 'uint16');
        passEncoder.drawIndexed(this.currentIdx, 1);
    }
}
