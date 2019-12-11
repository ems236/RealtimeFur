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

        this.camera = new Camera(6, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
        
        {
            const numComponents = 3;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            const offset = 0;         // how many bytes inside the buffer to start from
            this.gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            //console.log(this.programInfo);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
    
            this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
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

        this.gl.activeTexture(gl.TEXTURE0);
        this.gl.bindTexture(gl.TEXTURE_2D, load_texture(gl, "abstract"));
        this.gl.uniform1i(this.programInfo.uniformLocations.cube_texture, 0);
        
        this.setViewTransform();
    }

    redraw()
    {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
    
        // Clear the canvas before we start drawing on it.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFER, this.buffers.indices);
        {
            const offset = 0;
            const type = this.gl.UNSIGNED_SHORT;
            const vertexCount = 36;
            //this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
            this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
        }
    }

    mousedown(type, x, y)
    {
        this.x = x;
        this.y = y;

        if(type == 1)
        {
            this.leftMouseDown = true;
        }

        if(type == 2)
        {
            this.middleMouseDown = true;
        }

        if(type == 3)
        {
            this.rightMouseDown = true;
        }
    }

    mouseup(type)
    {
        if(type == 1)
        {
            this.leftMouseDown = false;
        }

        if(type == 2)
        {
            this.middleMouseDown = false;
        }

        if(type == 3)
        {
            this.rightMouseDown = false;
        }
    }

    
    anyMouseDown()
    {
        return this.rightMouseDown || this.middleMouseDown || this.leftMouseDown;
    }

    mousemove(x, y)
    {
        var xchange = x - this.x;
        var ychange = y - this.y;

        this.x = x;
        this.y = y;

        if(this.leftMouseDown)
        {
            //console.log("left is down");
            this.camera.changeLatitude(ychange);
            this.camera.changeLongitude(xchange);
            this.setViewTransform();

        }
        if(this.rightMouseDown)
        {
            //console.log("right is down");
            this.camera.changeRadius(ychange);
            this.setViewTransform();
        }
    }

    setViewTransform()
    {
        this.gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.viewMatrix,
            false,
            this.camera.viewMatrix());
    }

    loadSceneOBJ(filename) {

    }
}