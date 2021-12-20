import { mat4, vec3 } from 'gl-matrix';

export class Camera {

    public x: number = 0;
    public y: number = 15;
    public z: number = 0;

    public rotX: number = 0;
    public rotY: number = 0;
    public rotZ: number = 0;

    public fovy: number = (2 * Math.PI) / 5;
    public aspect: number = 16 / 9;

    public near: number = 0.1;
    public far: number = 1000;

    constructor (aspect: number) {
        this.aspect = aspect;
    }

    public getViewMatrix () : mat4 {
        let viewMatrix = mat4.create();

        mat4.lookAt(viewMatrix, vec3.fromValues(this.x, this.y, this.z), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        mat4.rotateX(viewMatrix, viewMatrix, this.rotX);
        mat4.rotateY(viewMatrix, viewMatrix, this.rotY);
        mat4.rotateZ(viewMatrix, viewMatrix, this.rotZ);
        return viewMatrix;
    }

    public getProjectionMatrix () : mat4 {
        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, this.fovy, this.aspect, this.near, this.far);
        return projectionMatrix;
    }

    public getCameraViewProjMatrix () : mat4 {
        const viewProjMatrix = mat4.create();
        const view = this.getViewMatrix();
        const proj = this.getProjectionMatrix();
        mat4.multiply(viewProjMatrix, proj, view);
        return viewProjMatrix;
    }

    public screenToWorld (x: number, y: number) {
        let z:number, w:number;
        let invW : number;
        let point: vec3 = [0, 0, 0];
        let pointMTX = mat4.create();
        let invViewProjection = mat4.create();
        let resultMTX: mat4;
          z = 1;
          mat4.multiply(invViewProjection, this.getProjectionMatrix(), this.getViewMatrix());
          resultMTX = mat4.clone(invViewProjection);
          mat4.invert(resultMTX, resultMTX);
          point = [x, y, z];
          mat4.identity(pointMTX);
          mat4.translate(pointMTX, pointMTX, point);
          mat4.multiply(resultMTX, resultMTX, pointMTX);
      
          point[0] = resultMTX[12];
          point[1] = resultMTX[13];
          point[2] = resultMTX[14];
          w = invViewProjection[12] * x + invViewProjection[13] * y + invViewProjection[15]; // required for perspective divide
          if (w !== 0) {
            invW = 1 / w;
            point[0] /= invW;
            point[1] /= invW;
            point[2] /= invW;
            point[0] = point[0] + (this.x);
            point[1] = point[1] + (this.y);
            point[2] = point[2] + (this.z);
          }
          console.log("screenToWorld: " + point[0] + ", " + point[1] + ", " + point[2]);
          return point;
      }     
}