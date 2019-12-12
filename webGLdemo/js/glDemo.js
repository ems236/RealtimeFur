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
    const shaderProgram = attachShaders(gl, shellVertexShader, textureFragmentSharder);
    const programInfo = 
    {
        program: shaderProgram,
        attribLocations: 
        {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          texCoords: gl.getAttribLocation(shaderProgram, 'aTexCoords'),
          vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
          furLength: gl.getAttribLocation(shaderProgram, 'aFurLength'),
        },
        uniformLocations: 
        {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
          colorTexture: gl.getUniformLocation(shaderProgram, 'uColorTexture'),
          shellAlphaTexture: gl.getUniformLocation(shaderProgram, 'uShellAlphaTexture'),
        }
    };

    var buffers = initBuffers(gl);
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
    //const positions = [
    //  -1.0,  1.0,
    //   1.0,  1.0,
    //  -1.0, -1.0,
    //   1.0, -1.0,
    //];

    const positions = [
        // front
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // back
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // right
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // left
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    const normals = [
        // front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);


    // in 3D, we also need to specify an index array
    // since we're just rendering a cube...
    const indexBuffer = gl.createBuffer();

    // bind it to the element array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // construct each face as a collection of 2 triangles
    const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];

    // use the indices rather than the positions
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
        gl.STATIC_DRAW);

    // colors
    const vertexColors = [
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0]
    ];

    var colors = [];
    for (var i = 0; i < vertexColors.length; i++) {
        colors.concat(vertexColors[i], vertexColors[i], vertexColors[i], vertexColors[i]);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    
    
    const textureCoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    const tex_coords = 
    [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // left
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tex_coords), gl.STATIC_DRAW);


    const furLengthBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, furLengthBuffer);
    const furLengths = 
    [
        0.2, 0.7, 0.3, 0.1,    // front
        0.2, 0.7, 0.3, 0.1,    // back
        0.2, 0.7, 0.3, 0.1,     // top
        0.2, 0.7, 0.3, 0.1,     // bottom
        0.2, 0.7, 0.3, 0.1,     // right
        0.2, 0.7, 0.3, 0.1,     // left
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(furLengths), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        color: colorBuffer,
        indices: indexBuffer,
        texCoords: textureCoordBuffer,
        furLength: furLengthBuffer,
    };
}
