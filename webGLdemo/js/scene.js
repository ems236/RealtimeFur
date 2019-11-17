class Scene
{
    constructor(gl, buffers, programInfo)
    {
        this.gl = gl;
        this.buffers = buffers;
        this.programInfo = programInfo;

        this.fieldOfView = 45 * Math.PI / 180;   // in radians
        this.aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;

        this.projectionMatrix = mat4.create();
        mat4.perspective(this.projectionMatrix,
            this.fieldOfView,
            this.aspect,
            this.zNear,
            this.zFar
        );

        //Should make an object class if we make more objects
        this.modelMatrix = mat4.create();

        this.camera = new Camera(vec3.fromValues(0, 0, 6), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0))
        
        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            const offset = 0;         // how many bytes inside the buffer to start from
            this.gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            console.log(this.programInfo);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
    
            this.gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        }

        this.gl.useProgram(this.programInfo.program);

        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            this.projectionMatrix);
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelMatrix,
            false,
            this.modelMatrix);
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.viewMatrix,
            false,
            this.camera.viewMatrix());
    }

    redraw()
    {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
    
        // Clear the canvas before we start drawing on it.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        {
            const offset = 0;
            const vertexCount = 4;
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
}