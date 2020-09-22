class SceneRender extends RenderBase{
    constructor() {
        super(sceneVs, sceneFs);

        this.camPos = [-6, 0, 0];
        this.dstPos = [0, 0, 0];

        // set up for render to texture
        this.makeFBO();
    }

    setVert(){
        // vertex
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(suzanneVert), gl.STATIC_DRAW);
        var attLocation = gl.getAttribLocation(this.m_program, 'aVertexPosition');
        gl.enableVertexAttribArray(attLocation);
        gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // indice
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // normal
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        var vertexNormalPos = gl.getAttribLocation(this.m_program, 'aVertexNormal');
        gl.enableVertexAttribArray(vertexNormalPos);
        gl.vertexAttribPointer(vertexNormalPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);


        // wrapped by vao
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        // vbo to vao
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        var attLocation = gl.getAttribLocation(this.m_program, 'aVertexPosition');
        gl.enableVertexAttribArray(attLocation);
        gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);
        // ibo to vao
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        // normal to vao
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        var vertexNormalPos = gl.getAttribLocation(this.m_program, 'aVertexNormal');
        gl.enableVertexAttribArray(vertexNormalPos);
        gl.vertexAttribPointer(vertexNormalPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
    };
    setUniform(){
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let projectionMatrix = MatCnvt.perspective(45, aspect, 0.1, 100);
        this.calcCamPos();
        let modelViewMatrix = MatCnvt.lookAt(this.camPos[0], this.camPos[1], this.camPos[2], this.dstPos[0], this.dstPos[1], this.dstPos[2], 0, 1, 0);
        let normalMatrix = MatCnvt.transposeMat4(MatCnvt.invert(MatCnvt.createIdentityMat()));
    
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.m_program, 'uProjectionMatrix'),
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.m_program, 'uModelViewMatrix'),
            false,
            modelViewMatrix);
    
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.m_program, 'uNormalMatrix'),
            false,
            normalMatrix);
    };
    drawScene(){
        // render to texture
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.m_program);
        gl.bindVertexArray(this.vao);
        this.setUniform(this.m_program);
        gl.drawElements(gl.TRIANGLES, 2904, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    };
    calcCamPos(){
        const rotation = 1;
        const pi = Math.PI;
        const rad = rotation * (pi/180);
        this.camPos = MatCnvt.rotateY(this.camPos, this.dstPos, rad);
    };
}