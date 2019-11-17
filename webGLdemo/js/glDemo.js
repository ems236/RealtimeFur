$(document).ready(function(){
    main();
});

const PI = 3.14159;
var currentScene;
function clamp(val, min, max) 
{
    if(val > max)
    {
        return max;
    }
    if(val < min)
    {
        return min;
    }
    return val;
}

function bindMouseEvents(canvas)
{
    canvas.on("mousedown", function(event){
        if(currentScene)
        {
            if(!currentScene.anyMouseDown())
            {
                canvas.on("mousemove", function(event){
                    if(currentScene)
                    {
                        currentScene.mousemove(event.pageX, event.pageY);
                        currentScene.redraw();
                    }
                });
            }

            currentScene.mousedown(event.which, event.pageX, event.pageY);
            event.preventDefault();
        }
    });

    $(document).on("mouseup", function(event){
        if(currentScene)
        {
            currentScene.mouseup(event.which);

            if(!currentScene.anyMouseDown())
            {
                canvas.off("mousemove");
            }
        }
    });

    canvas.on("contextmenu", function(event) {event.preventDefault();});
}

function main()
{
    const canvas = $("#glCanvas");
    bindMouseEvents(canvas);
    const gl = canvas[0].getContext("webgl");

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
    currentScene = new Scene(gl, buffers, programInfo);
    currentScene.redraw();
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
