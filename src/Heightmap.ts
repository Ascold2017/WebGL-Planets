import { mat4, vec3 } from 'gl-matrix';
import WebGLEngine from './WebGLEngine'
export default class Heightmap extends WebGLEngine {
    private gridWidth = 0;
    private gridDepth = 0;
    private gridPoints: number[] = []
    private gridIndices: number[] = []
    constructor(canvas: HTMLCanvasElement) {
        super(canvas)
        const img = new Image();
        img.src = '/heightMap.png';
        img.onload = () => {
            this.generateHeightPoints(img, 10);
            this.generateIndices();
            // this.testPoints();
            this.setProjectionMatrix(this.generateProjectionMatrix())
            this.refreshGL();
            this.drawFigure({
                vertices: this.gridPoints,
                indices: this.gridIndices,
                translation: { x: 0, y: 0 },
                rotationZ: 0,
                name: 'terrain',
                scaleXY: 1,
                mvMatrix: mat4.identity(mat4.create()),
                children: []
            })
        }

    }

    testPoints() {

        this.gridWidth = 40;
        this.gridDepth = 40;
        for (let z = 0; z <= this.gridDepth; ++z) {
            for (let x = 0; x <= this.gridWidth; ++x) {
                this.gridPoints.push(x, 0, z);
            }
        }

        const rowStride = this.gridWidth + 1;
        // x lines
        for (let z = 0; z <= this.gridDepth; ++z) {
            const rowOff = z * rowStride;
            for (let x = 0; x < this.gridWidth; ++x) {
                this.gridIndices.push(rowOff + x, rowOff + x + 1);
            }
        }
        // z lines
        for (let x = 0; x <= this.gridWidth; ++x) {
            for (let z = 0; z < this.gridDepth; ++z) {
                const rowOff = z * rowStride;
                this.gridIndices.push(rowOff + x, rowOff + x + rowStride);
            }
        }

    }

    //creating plane
    private generateHeightPoints(img: HTMLImageElement, maxHeight: number) {
        const ctx = document.createElement("canvas").getContext("2d")!; //using 2d canvas to read image
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        console.log(imgData)
        this.gridWidth = imgData.width - 1;
        this.gridDepth = imgData.height - 1;

        for (let z = 0; z <= this.gridDepth; ++z) {
            for (let x = 0; x <= this.gridWidth; ++x) {
                let offset = (z * imgData.width + x) * 4;
                let height = imgData.data[offset] * maxHeight / 255;
                this.gridPoints.push(x, height, z);
            }
        }
    }

    private generateIndices() {
        let rowOff = 0;
        const rowStride = this.gridWidth - 1;
        for (let z = 0; z <= this.gridDepth; ++z) {
            rowOff = z * rowStride;
            for (let x = 0; x < this.gridWidth; ++x) {
                this.gridIndices.push(rowOff + x, rowOff + x + 1);
            }
        }

        for (let x = 0; x <= this.gridWidth; ++x) {
            for (let z = 0; z < this.gridDepth; ++z) {
                rowOff = z * rowStride;
                this.gridIndices.push(rowOff + x, rowOff + x + rowStride);
            }
        }
    }

    private generateProjectionMatrix() {
        const projection = mat4.perspective(mat4.create(),
            60 * Math.PI / 180,   // field of view
            1, // aspect
            0.1,  // near
            100,  // far
        );
        const cameraPosition = vec3.set(vec3.create(), -this.gridWidth / 8, 10, -this.gridDepth / 8);
        const target = vec3.set(vec3.create(), this.gridWidth / 2, -10, this.gridDepth / 2);
        const up = vec3.set(vec3.create(), 0, 1, 0);
        const camera = mat4.lookAt(mat4.create(), cameraPosition, target, up);
        return mat4.multiply(mat4.create(), projection, camera);
    }

}