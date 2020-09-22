class ScreenRender extends RenderBase{
    constructor(Vs, Fs) {
        super(Vs, Fs);
    }

    setVert(){
        // vertex
        const quadVert = [
            -1.0, 1.0,
            1.0, 1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ];
        var attLocation = gl.getAttribLocation(this.m_program, 'aVertexPosition');
        var attStride = 2;
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVert), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(attLocation);
        gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

        // indice
        const quadInd = [
            0, 1, 2,
            3, 2, 1
        ];
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(quadInd), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


        // setting vao
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        // vbo to vao
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        var attLocation = gl.getAttribLocation(this.m_program, 'aVertexPosition');
        gl.enableVertexAttribArray(attLocation);
        gl.vertexAttribPointer(attLocation, 2, gl.FLOAT, false, 0, 0);
        // ibo to vao
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bindVertexArray(null);

    };
    setUniform(){
        gl.uniform1i(gl.getUniformLocation(this.m_program, 'width'), 600);
        gl.uniform1i(gl.getUniformLocation(this.m_program, 'height'), 600);
        var ind = 0;
        gl.activeTexture(gl.TEXTURE0 + ind);
        gl.bindTexture(gl.TEXTURE_2D, this.targetTexture);
        gl.uniform1i(gl.getUniformLocation(this.m_program, "tex"), ind);
    };
    drawScene(){
        // gl.viewport(0, 0, 600, 600);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.m_program);
        gl.bindVertexArray(this.vao);
        this.setUniform(this.m_program);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    };
}