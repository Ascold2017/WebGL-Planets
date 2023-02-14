import { mat3, mat4, quat, vec3 } from "gl-matrix";
import LoopEngine from "./LoopEngine";
import WebGLEngine from "./WebGLEngine";

export interface RawObject3D {
    name: string;
    vertices: number[];
    indices: number[],
    translation: {
        x: number;
        y: number;
    }
    rotationZ: number;
    scaleXY: number;
    children?: RawObject3D[]
}

export interface Object3D extends RawObject3D {
    mvMatrix: mat4;
    children: Object3D[]
}


export default class Core extends WebGLEngine {
    private objects3D: Object3D[] = []
    private readonly loopEngine: LoopEngine;
    constructor(canvas: HTMLCanvasElement, data: RawObject3D[]) {
        super(canvas);
        this.objects3D = this.initObjects(data)
        this.loopEngine = new LoopEngine();
        this.loopEngine.addLoop('renderLoop', () => {
            this.rotateObjects();
            this.applyObjectsMatrix();
            this.render()
        })
    }

    private initObjects(data: RawObject3D[]): Object3D[] {
        return data.map(item => ({ ...item, mvMatrix: mat4.identity(mat4.create()), children: this.initObjects(item.children || []) }))
    }

    private rotateObjects() {
        const rotateZRecursive = (objects: Object3D[]): Object3D[] => {
            return objects.map(obj => ({ ...obj, rotationZ: obj.rotationZ + 0.01, children: rotateZRecursive(obj.children) }));
        }
        this.objects3D = rotateZRecursive(this.objects3D);
    }

    private applyObjectsMatrix() {
        const applyMatrixRecursive = (objects: Object3D[], parent?: Object3D): Object3D[] => {
            return objects.map(obj => {
                mat4.identity(obj.mvMatrix);
                let worldScaleK = 1;
                if (parent) {
                    mat4.multiply(obj.mvMatrix, obj.mvMatrix, parent.mvMatrix)
                    worldScaleK /= parent.scaleXY;
                }

                mat4.translate(obj.mvMatrix, obj.mvMatrix, [obj.translation.x * worldScaleK, obj.translation.y * worldScaleK, 0]);

                mat4.rotateZ(obj.mvMatrix, obj.mvMatrix, obj.rotationZ)

                mat4.scale(obj.mvMatrix, obj.mvMatrix, [obj.scaleXY * worldScaleK, obj.scaleXY * worldScaleK, 1])

                return { ...obj, mvMatrix: obj.mvMatrix, children: applyMatrixRecursive(obj.children, obj) }
            })
        }
        this.objects3D = applyMatrixRecursive(this.objects3D)
    }

    private render() {
        this.refreshGL();
        const drawObjects = (objects: Object3D[]) => objects.forEach(o => {
            this.drawFigure(o);
            drawObjects(o.children)
        })
        drawObjects(this.objects3D)
    }
}