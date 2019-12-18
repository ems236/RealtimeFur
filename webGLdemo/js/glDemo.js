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
                        //currentScene.redraw();
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

function readAllSceneSettings()
{
    return {
        shouldDrawBase: $("#draw-base")[0].checked,
        shouldDrawShells: $("#draw-shells")[0].checked,
        shouldDrawFins: $("#draw-fins")[0].checked,
        furLengthMultiplier: $("#fur-multiplier").val(),
        colorNoiseMixingRatio: $("#color-noise").val(), 
        shouldDrawAllFins: $("#filter-fins")[0].checked,
        finLengthMultiplier: $("#fin-multiplier").val(),
        sillhouetteEdgeThreshold: $("#sillhouette-threshold").val(),
        minSelfShadowFactor: $("#min-self-shadow").val(),
        ka: $("#ka").val(),
        kd: $("#kd").val(),
        ks: $("#ks").val(),
        ns: $("#ns").val(),
        lightIntensity: vec3.fromValues($("#light-r").val(), $("#light-g").val(), $("#light-b").val()),
        ambientIntensity: vec3.fromValues($("#ambient-r").val(), $("#ambient-g").val(), $("#ambient-b").val()),
        windPosition: vec3.fromValues($("#wind-x").val(), $("#wind-y").val(), $("#wind-z").val()),
        windIntensity: $("#wind-intensity").val(),
    };
}

function bindInputEvents()
{
    $(".realtime-scene-control").change(function()
    {
        currentScene.setSceneSettings(readAllSceneSettings());
    })

    /*
    $("#draw-base").change(function()
    {
        currentScene.shouldDrawBase = this.checked;
        //currentScene.redraw();
    });

    $("#draw-shells").change(function()
    {
        currentScene.shouldDrawShells = this.checked;
        //currentScene.redraw();
    });

    $("#draw-fins").change(function()
    {
        currentScene.shouldDrawFins = this.checked;
        //currentScene.redraw();
    });

    $("#filter-fins").change(function()
    {
        currentScene.alphaBlendAllFins = this.checked;
        if(this.checked)
        {
            currentScene.loadFins();
        }
        //currentScene.redraw();
    });
    */


//    $('#objectSelection').change(function() {
//        var renderObject = $('#objectSelection').val();
//        var objectData;
//        switch (renderObject) {
//            case 'Cube': objectData = loadObject();
//                break;
//            case 'Sphere': objectData = loadSphere();
//                break;
//            case 'Bunny':
//                objectData = loadSphere();
//                console.log("it's a bunny");
//                break;
//        }
//
//        currentScene.objectData = objectData;
//        currentScene.redraw();
//    });
}

function main()
{
    const canvas = $("#glCanvas");
    bindMouseEvents(canvas);
    bindInputEvents();
    const gl = canvas[0].getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    //get shaders going
    const baseShaderProgram = attachShaders(gl, baseVertexShader, baseFragmentShader);
    const baseProgramInfo = 
    {
        program: baseShaderProgram,
        attribLocations: 
        {
          vertexPosition: gl.getAttribLocation(baseShaderProgram, 'aVertexPosition'),
          texCoords: gl.getAttribLocation(baseShaderProgram, 'aTexCoords'),
          vertexNormal: gl.getAttribLocation(baseShaderProgram, 'aVertexNormal'),
        },
        uniformLocations: 
        {
          projectionMatrix: gl.getUniformLocation(baseShaderProgram, 'uProjectionMatrix'),
          modelMatrix: gl.getUniformLocation(baseShaderProgram, 'uModelMatrix'),
          viewMatrix: gl.getUniformLocation(baseShaderProgram, 'uViewMatrix'),
          normalMatrix: gl.getUniformLocation(baseShaderProgram, 'uNormalMatrix'),
          colorTexture: gl.getUniformLocation(baseShaderProgram, 'uColorTexture'),
          minShadowFactor: gl.getUniformLocation(baseShaderProgram, 'uMinShadowFactor'),
          ka: gl.getUniformLocation(baseShaderProgram, 'uKa'),
          kd: gl.getUniformLocation(baseShaderProgram, 'uKd'),
          ks: gl.getUniformLocation(baseShaderProgram, 'uKs'),
          ns: gl.getUniformLocation(baseShaderProgram, 'uNs'),
          ambientIntensity: gl.getUniformLocation(baseShaderProgram, 'uAmbientIntensity'),
          lightIntensity: gl.getUniformLocation(baseShaderProgram, 'uLightIntensity'),
        }
    };

    const shellShaderProgram = attachShaders(gl, shellVertexShader, shellFragmentShader);
    const shellProgramInfo = 
    {
        program: shellShaderProgram,
        attribLocations: 
        {
          vertexPosition: gl.getAttribLocation(shellShaderProgram, 'aVertexPosition'),
          texCoords: gl.getAttribLocation(shellShaderProgram, 'aTexCoords'),
          vertexNormal: gl.getAttribLocation(shellShaderProgram, 'aVertexNormal'),
          furLength: gl.getAttribLocation(shellShaderProgram, 'aFurLength'),
        },
        uniformLocations: 
        {
            projectionMatrix: gl.getUniformLocation(shellShaderProgram, 'uProjectionMatrix'),
            modelMatrix: gl.getUniformLocation(shellShaderProgram, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(shellShaderProgram, 'uViewMatrix'),
            normalMatrix: gl.getUniformLocation(shellShaderProgram, 'uNormalMatrix'),
            colorTexture: gl.getUniformLocation(shellShaderProgram, 'uColorTexture'),
            shellAlphaTexture: gl.getUniformLocation(shellShaderProgram, 'uShellAlphaTexture'),
            shellCount: gl.getUniformLocation(shellShaderProgram, 'uShellCount'),
            currentShell: gl.getUniformLocation(shellShaderProgram, 'uCurrentShell'),
            windSource: gl.getUniformLocation(shellShaderProgram, 'uWindSource'),
            windIntensity: gl.getUniformLocation(shellShaderProgram, 'uWindIntensity'),
            netForce: gl.getUniformLocation(shellShaderProgram, 'uModelForce'),
            noiseFactor: gl.getUniformLocation(shellShaderProgram, 'uColorNoiseFactor'),
            furLengthMultiplier: gl.getUniformLocation(shellShaderProgram, 'uFurLengthMultiplier'),
            minShadowFactor: gl.getUniformLocation(shellShaderProgram, 'uMinShadowFactor'),
            ka: gl.getUniformLocation(shellShaderProgram, 'uKa'),
            kd: gl.getUniformLocation(shellShaderProgram, 'uKd'),
            ks: gl.getUniformLocation(shellShaderProgram, 'uKs'),
            ns: gl.getUniformLocation(shellShaderProgram, 'uNs'),
            ambientIntensity: gl.getUniformLocation(shellShaderProgram, 'uAmbientIntensity'),
            lightIntensity: gl.getUniformLocation(shellShaderProgram, 'uLightIntensity'),
        }
    };

    const finShaderProgram = attachShaders(gl, finVertexShader, finFragmentShader);
    const finProgramInfo = 
    {
        program: finShaderProgram,
        attribLocations:
        {
            vertexPosition: gl.getAttribLocation(finShaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(finShaderProgram, 'aVertexNormal'),
            finTexCoords: gl.getAttribLocation(finShaderProgram, 'aFinTexCoords'),
            colorTexCoords: gl.getAttribLocation(finShaderProgram, 'aColorTexCoords'),
        },
        uniformLocations:
        {
            projectionMatrix: gl.getUniformLocation(finShaderProgram, 'uProjectionMatrix'),
            modelMatrix: gl.getUniformLocation(finShaderProgram, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(finShaderProgram, 'uViewMatrix'),
            normalMatrix: gl.getUniformLocation(finShaderProgram, 'uNormalMatrix'),
            colorTexture: gl.getUniformLocation(finShaderProgram, 'uColorTexture'),
            finTexture: gl.getUniformLocation(finShaderProgram, 'uFinTexture'),
            shouldBlendFins: gl.getUniformLocation(finShaderProgram, 'uShouldModifyFinAlpha'),
            noiseFactor: gl.getUniformLocation(finShaderProgram, 'uColorNoiseFactor'),
            minShadowFactor: gl.getUniformLocation(finShaderProgram, 'uMinShadowFactor'),
            ka: gl.getUniformLocation(finShaderProgram, 'uKa'),
            kd: gl.getUniformLocation(finShaderProgram, 'uKd'),
            ks: gl.getUniformLocation(finShaderProgram, 'uKs'),
            ns: gl.getUniformLocation(finShaderProgram, 'uNs'),
            ambientIntensity: gl.getUniformLocation(finShaderProgram, 'uAmbientIntensity'),
            lightIntensity: gl.getUniformLocation(finShaderProgram, 'uLightIntensity'),
        }
    }

    var objectData = loadSphere();

    const programInfo = 
    {
        baseProgramInfo: baseProgramInfo,
        shellProgramInfo: shellProgramInfo,
        finProgramInfo: finProgramInfo,
    }

    console.log(programInfo);
    var sceneSettings = readAllSceneSettings();
    currentScene = new Scene(gl, objectData, programInfo, sceneSettings);
    //currentScene.redraw();
}

var previousTime = Date.now();
function animateScene(timestamp)
{
    displayFPS(timestamp);
    currentScene.redraw(timestamp);
}

function displayFPS(currentTime)
{
    var difference = currentTime - previousTime;
    previousTime = currentTime;

    var FPS = 1000 / difference;
    $("#fps-counter").html(FPS.toFixed(1));
}

function loadSphere()
{
    var sphere = getSphere();

    var positions = sphere.positions;
    var faces = sphere.faces;

    var normals = new Array(positions.length);
    normals.fill(0);
    var texCoords = new Array(2 * positions.length / 3);
    var furLengths = new Array(positions.length / 3);

    //sphere definition is 1 indexed
    //webgl is 0 indexed
    for(var vertexIndexIndex = 0; vertexIndexIndex < faces.length; vertexIndexIndex++)
    {
        faces[vertexIndexIndex] -= 1;
    }

    for(var faceIndex = 0; faceIndex < faces.length / 3; faceIndex++)
    {
        var v1index = faces[faceIndex * 3];
        var v2index = faces[faceIndex * 3 + 1];
        var v3index = faces[faceIndex * 3 + 2];

        var v1 = getVertex(v1index, positions);
        var v2 = getVertex(v2index, positions);
        var v3 = getVertex(v3index, positions);


        var e1 = vec3.create();
        vec3.subtract(e1, v3, v1);

        var e2 = vec3.create();
        vec3.subtract(e2, v2, v3);

        var normal = vec3.create();
        vec3.cross(normal, e2, e1);

        addNormal(normal, v1index, normals);
        addNormal(normal, v2index, normals);
        addNormal(normal, v3index, normals);
    }

    for(var vertexIndex = 0; vertexIndex < positions.length / 3; vertexIndex++)
    {
        furLengths[vertexIndex] = 0.2;
        
        //Spherical coords
        var position = getVertex(vertexIndex, positions);

        var theta = Math.atan2(position[0], position[2]);
        var phi = Math.atan2(Math.pow(position[0] * position[0] + position[2] * position[2], 0.5), position[1]);

        setTexCoord(1 - (theta / (2 * 3.14159) + 0.5), 1 - (phi / 3.14159), vertexIndex, texCoords);
    }

    sharedTriangles = loadFinEdgeList(faces, positions);

    return {
        position: positions,
        normal: normals,
        face: faces,
        texCoord: texCoords,
        furLength: furLengths,
        sharedTriangle: sharedTriangles
    }
}

function loadFinEdgeList(faces, positions)
{
    var sharedTrianges = [];
    for(var faceIndex = 0; faceIndex < faces.length / 3; faceIndex++)
    {
        var v1index = faces[faceIndex * 3];
        var v2index = faces[faceIndex * 3 + 1];
        var v3index = faces[faceIndex * 3 + 2];

        var normal1 = normalOfPositions(v1index, v2index, v3index, positions);

        var edges = [{v1: v1index, v2:v2index, v3:v3index}, {v1: v2index, v2:v3index, v3:v1index}, {v1: v1index, v2:v3index, v3:v2index}];
        for(var edgeIndex = 0; edgeIndex < 3; edgeIndex++)
        {
            var edge = edges[edgeIndex];
            var sharedTriangeV3 = sharedTriangle(faces, faceIndex + 1, edge.v1, edge.v2);

            if(sharedTriangeV3)
            {
                var normal2 = normalOfPositions(edge.v1, edge.v2, sharedTriangeV3, positions);
                var currentFinNormal = finNormal(edge.v1, edge.v2, positions);
                vec4.normalize(currentFinNormal, currentFinNormal);
                sharedTrianges.push(
                    {
                        sharedv1: edge.v1,
                        sharedv2: edge.v2,
                        norm1: normal1,
                        norm2: normal2,
                        v3: edge.v3,
                        v4: sharedTriangeV3,
                        finNormal: currentFinNormal,
                    }
                );
            } 
        }
    }

    return sharedTrianges;
}

function normalOfPositions(v1index, v2index, v3index, positions)
{
    var v1 = getVertex(v1index, positions);
    var v2 = getVertex(v2index, positions);
    var v3 = getVertex(v3index, positions);

    return normalOf(v1, v2, v3);
}

function finNormal(v1index, v2index, positions)
{
    var v1 = getVertex(v1index, positions);
    var v2 = getVertex(v2index, positions);
    var v3 = vec3.fromValues(0, 0, 0);

    return normalOf(v1, v2, v3);
}

function normalOf(v1, v2, v3)
{
    var e1 = vec3.create();
    vec3.subtract(e1, v2, v1);

    var e2 = vec3.create();
    vec3.subtract(e2, v2, v3);

    var normal = vec3.create();
    vec3.cross(normal, e2, e1);

    if(vec3.dot(normal, v1) < 0)
    {
        vec3.scale(normal, normal, -1);
    }

    return vec4.fromValues(normal[0], normal[1], normal[2], 0.0);
}

function sharedTriangle(faces, startIndex, originalV1, originalV2)
{
    for(var faceIndex = startIndex; faceIndex < faces.length / 3; faceIndex++)
    {
        var v1index = faces[faceIndex * 3];
        var v2index = faces[faceIndex * 3 + 1];
        var v3index = faces[faceIndex * 3 + 2];

        var matchedV1 = false;
        var matchedV2 = false;
        var newV3 = undefined;

        for(var vertexIndexIndex = faceIndex * 3; vertexIndexIndex < faceIndex * 3 + 3; vertexIndexIndex++)
        {
            if(faces[vertexIndexIndex] == originalV1)
            {
                matchedV1 = true;
            }
            else if(faces[vertexIndexIndex] == originalV2)
            {
                matchedV2 = true;
            }
            else
            {
                newV3 = faces[vertexIndexIndex];
            }
        }

        if(matchedV1 && matchedV2)
        {
            return newV3;
        }
    }

    return undefined;
}

function getTexCoords(index, texCoords)
{
    startIndex = 2 * index;
    return {u: texCoords[startIndex], v: texCoords[startIndex + 1]};
}

function getVertex(index, positions)
{
    startIndex = 3 * index;
    var x = positions[startIndex];
    var y = positions[startIndex + 1];
    var z = positions[startIndex + 2];
    
    var vertex = vec3.create();
    vec3.set(vertex, x, y, z);
    return vertex;  
}

function addNormal(normal, index, normals)
{
    startIndex = 3 * index;
    normals[startIndex] += normal[0];
    normals[startIndex + 1] += normal[1];
    normals[startIndex + 2] += normal[2];
}

function setTexCoord(u, v, index, texCoords)
{
    startIndex = 2 * index;
    texCoords[startIndex] = clamp(u, 0, 1);
    texCoords[startIndex + 1] = clamp(v, 0, 1);
}

function loadObject() 
{
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

    const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];

    const tex_coords = 
    [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,     // left
    ];

    const furLengths = 
    [
        0.2, 0.7, 0.3, 0.1,    // front
        0.2, 0.7, 0.3, 0.1,    // back
        0.2, 0.7, 0.3, 0.1,     // top
        0.2, 0.7, 0.3, 0.1,     // bottom
        0.2, 0.7, 0.3, 0.1,     // right
        0.2, 0.7, 0.3, 0.1,     // left
    ];


    return {
        position: positions,
        normal: normals,
        face: indices,
        texCoord: tex_coords,
        furLength: furLengths
    }
}