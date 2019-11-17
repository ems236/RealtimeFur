$(document).ready(function(){
    main();
});

function main()
{
    const canvas = $("#glCanvas")[0];
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    //get shaders going
    const shaderProgram = attachShaders(gl, simpleVertexShader, whiteFragmentSharder);
    const programInfo = 
    {
        program: shaderProgram,
        attribLocations: 
        {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: 
        {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
        },
    };

    var buffers = initBuffers(gl)

    console.log(programInfo);
    var scene = new Scene(gl, buffers, programInfo);
    scene.redraw();
}

function initBuffers(gl) 
{
    const positionBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Now create an array of positions for the square.
    //LOAD OBJ HERE
    const positions = [
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];
  
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
  
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(positions),
                  gl.STATIC_DRAW);
  
    return {
      position: positionBuffer
    };
}
