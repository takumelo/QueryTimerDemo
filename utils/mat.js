class MatCnvt{
    static lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ){
        // Ref:https://yttm-work.jp/gmpg/gmpg_0003.html

        // calc row-major
        // moveCam
        let moveCam = [0, 0, 0];
        moveCam[0] = centerX - eyeX;
        moveCam[1] = centerY - eyeY;
        moveCam[2] = centerZ - eyeZ;

        // Z axis
        let camZAxisVec = [0, 0, 0];
        camZAxisVec[0] = moveCam[0];
        camZAxisVec[1] = moveCam[1];
        camZAxisVec[2] = moveCam[2];
        camZAxisVec = this._calcUnitVec(camZAxisVec);

        // X axis
        let camXAxisVec = [0, 0, 0];
        camXAxisVec[0] = upY * camZAxisVec[2] - upZ * camZAxisVec[1];
        camXAxisVec[1] = -1 * (upX * camZAxisVec[2] - upZ * camZAxisVec[0]);
        camXAxisVec[2] = upX * camZAxisVec[1] - upY * camZAxisVec[0];
        camXAxisVec = this._calcUnitVec(camXAxisVec);

        // Y axis
        let camYAxisVec = [0, 0, 0];
        camYAxisVec[0] = camZAxisVec[1] * camXAxisVec[2] - camZAxisVec[2] * camXAxisVec[1];
        camYAxisVec[1] = -1 * (camZAxisVec[0] * camXAxisVec[2] - camZAxisVec[2] * camXAxisVec[0]);
        camYAxisVec[2] = camZAxisVec[1] * camXAxisVec[1] - camZAxisVec[1] * camXAxisVec[0];
        camYAxisVec = this._calcUnitVec(camYAxisVec);

        
        // translation vec
        let transVec = [0, 0, 0];
        transVec[0] = moveCam[0] * camXAxisVec[0] + moveCam[1] * camXAxisVec[1] + moveCam[2] * camXAxisVec[2];
        transVec[1] = moveCam[0] * camYAxisVec[0] + moveCam[1] * camYAxisVec[1] + moveCam[2] * camYAxisVec[2];
        transVec[2] = moveCam[0] * camZAxisVec[0] + moveCam[1] * camZAxisVec[1] + moveCam[2] * camZAxisVec[2];

        // camera coordinate vec(row major)
        let camVec = new Array(16).fill(0);
        camVec[0] = camXAxisVec[0];
        camVec[1] = camXAxisVec[1];
        camVec[2] = camXAxisVec[2];
        camVec[3] = 0;
        camVec[4] = camYAxisVec[0];
        camVec[5] = camYAxisVec[1];
        camVec[6] = camYAxisVec[2];
        camVec[7] = 0;
        camVec[8] = camZAxisVec[0];
        camVec[9] = camZAxisVec[1];
        camVec[10] = camZAxisVec[2];
        camVec[11] = 0;
        camVec[12] = transVec[0];
        camVec[13] = transVec[1];
        camVec[14] = transVec[2];
        camVec[15] = 1;

        let invCamVec = new Array(16).fill(0);
        invCamVec[0] = camVec[0];
        invCamVec[1] = camVec[4];
        invCamVec[2] = camVec[8];
        invCamVec[3] = -camVec[12];
        invCamVec[4] = camVec[1];
        invCamVec[5] = camVec[5];
        invCamVec[6] = camVec[9];
        invCamVec[7] = -camVec[13];
        invCamVec[8] = camVec[2];
        invCamVec[9] = camVec[6];
        invCamVec[10] = camVec[10];
        invCamVec[11] = -camVec[14];
        invCamVec[12] = camVec[3];
        invCamVec[13] = camVec[7];
        invCamVec[14] = camVec[11];
        invCamVec[15] = camVec[15];

        // WebGL use column-major. so transpose.
        let transposeCamVec = this.transposeMat4(invCamVec);

        return transposeCamVec;
    }
    static perspective(fov, aspect, near, far){
        // Ref: gl-matrix by Brandon Jones and Colin MacKenzie IV
        let scaleX = 1 / Math.tan(fov / 2 * Math.PI / 180) / aspect;
        let scaleY = 1 / Math.tan(fov / 2 * Math.PI / 180);
        let scaleZ = (far + near) / (near - far);
        let transZ = 2 * far * near / (near - far);
        let projMat = new Array(16).fill(0);
        projMat[0] = scaleX;
        projMat[1] = 0;
        projMat[2] = 0;
        projMat[3] = 0;
        projMat[4] = 0;
        projMat[5] = scaleY;
        projMat[6] = 0;
        projMat[7] = 0;
        projMat[8] = 0;
        projMat[9] = 0;
        projMat[10] = scaleZ;
        projMat[11] = transZ;
        projMat[12] = 0;
        projMat[13] = 0;
        projMat[14] = -1;
        projMat[15] = 0;
        let transposeProjMat = this.transposeMat4(projMat);
        return transposeProjMat;
    }
    static invert(a) {
        let a00 = a[0],
            a01 = a[1],
            a02 = a[2],
            a03 = a[3];
        let a10 = a[4],
            a11 = a[5],
            a12 = a[6],
            a13 = a[7];
        let a20 = a[8],
            a21 = a[9],
            a22 = a[10],
            a23 = a[11];
        let a30 = a[12],
            a31 = a[13],
            a32 = a[14],
            a33 = a[15];
        
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;
        
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        
        if (!det) {
            return null;
        }
        det = 1.0 / det;
        let out = new Array(16).fill(0);
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        
        return out;
        }
    static _calcUnitVec(vec3){
        let vecSize = Math.sqrt(vec3[0] ** 2 + vec3[1] ** 2 + vec3[2] ** 2);
        vec3[0] = vec3[0] / vecSize;
        vec3[1] = vec3[1] / vecSize;
        vec3[2] = vec3[2] / vecSize;
        return vec3;
    }
    static transposeMat4(mat4){
        let transposedMat4 = new Array(16).fill(0);
        transposedMat4[0] = mat4[0];
        transposedMat4[1] = mat4[4];
        transposedMat4[2] = mat4[8];
        transposedMat4[3] = mat4[12];
        transposedMat4[4] = mat4[1];
        transposedMat4[5] = mat4[5];
        transposedMat4[6] = mat4[9];
        transposedMat4[7] = mat4[13];
        transposedMat4[8] = mat4[2];
        transposedMat4[9] = mat4[6];
        transposedMat4[10] = mat4[10];
        transposedMat4[11] = mat4[14];
        transposedMat4[12] = mat4[3];
        transposedMat4[13] = mat4[7];
        transposedMat4[14] = mat4[11];
        transposedMat4[15] = mat4[15];
        return transposedMat4;
    }
    static createIdentityMat() {
        let out = new Array(16).fill(0);
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }

    static rotateX(a, b, c) {
        let out = new Array(3).fill(0);
        let p = [],
            r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[0];
        r[1] = p[1] * Math.cos(c) - p[2] * Math.sin(c);
        r[2] = p[1] * Math.sin(c) + p[2] * Math.cos(c);

        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];

        return out;
    }

    static rotateY(a, b, c) {
        let out = new Array(3).fill(0);
        let p = [],
            r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[2] * Math.sin(c) + p[0] * Math.cos(c);
        r[1] = p[1];
        r[2] = p[2] * Math.cos(c) - p[0] * Math.sin(c);

        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];

        return out;
    }

    static rotateZ(a, b, c) {
        let out = new Array(3).fill(0);
        let p = [],
            r = [];
        //Translate point to the origin
        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2];

        //perform rotation
        r[0] = p[0] * Math.cos(c) - p[1] * Math.sin(c);
        r[1] = p[0] * Math.sin(c) + p[1] * Math.cos(c);
        r[2] = p[2];

        //translate to correct position
        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];

        return out;
    }

}