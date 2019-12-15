//Big note
//If we host this with a real web site we can more conveniently load them with ajax

var whiteFragmentSharder = `
    void main() 
    {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`

var baseVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTexCoords;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying vec2 texture_coords;
    varying vec3 normal;

    void main() {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;
        texture_coords = aTexCoords;
        normal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
        gl_Position = uProjectionMatrix * base_position;
    }
`

var baseFragmentShader = `
    precision mediump float;
        
    uniform sampler2D uColorTexture;

    varying vec2 texture_coords;
    varying vec3 normal;

    void main() 
    {
        vec4 color = texture2D(uColorTexture, texture_coords);
        gl_FragColor = vec4(color.rgb, 1.0);
        //gl_FragColor = vec4(1.0, 0.0, color.b, 1.0);
    }
`

var shellVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTexCoords;
    attribute vec3 aVertexNormal;
    attribute float aFurLength;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    uniform float uCurrentShell;
    uniform float uShellCount;

    varying vec2 texture_coords;
    varying vec3 normal;

    void main() {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;
        
        texture_coords = aTexCoords;
        normal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;

        vec4 displacement = vec4(normalize(normal) * aFurLength * (uCurrentShell / uShellCount), 0.0);
        //vec4 displacement = vec4(normal * 0.0, 0.0);
        gl_Position = uProjectionMatrix * (base_position + displacement);
    }
`

var shellFragmentShader = `
    precision mediump float;
    
    uniform sampler2D uColorTexture;
    uniform sampler2D uShellAlphaTexture;
    uniform highp float uCurrentShell;

    varying vec2 texture_coords;
    varying vec3 normal;

    void main() 
    {
        vec4 color = texture2D(uColorTexture, texture_coords);
        
        
        float alpha = texture2D(uShellAlphaTexture, texture_coords).a;
        
        //gl_FragColor = vec4(abs(normal.x), abs(normal.y), abs(normal.z), 1.0);

        //gl_FragColor = vec4(texture_coords, 0.0, 1.0);
        //gl_FragColor = vec4(color.aaa, 0.5);
        gl_FragColor = vec4(color.rgb, alpha);
        //gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        //gl_FragColor = vec4(texture2D(uShellAlphaTexture, texture_coords).rgb, alpha);
    }
`

var finVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 aFinTexCoords;
    attribute vec2 aColorTexCoords;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying vec2 finTexCoords;
    varying vec2 colorTexCoords;

    void main() 
    {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;
        finTexCoords = aFinTexCoords;
        colorTexCoords = aColorTexCoords;
        gl_Position = uProjectionMatrix * base_position;
    }
`

var finFragmentShader = `
    precision mediump float;

    varying vec2 finTexCoords;
    varying vec2 colorTexCoords;

    uniform sampler2D uFinTexture;
    uniform sampler2D uColorTexture;

    void main()
    {
        vec3 color = texture2D(uColorTexture, colorTexCoords).rgb;
        float alpha = texture2D(uFinTexture, finTexCoords).a;
        gl_FragColor = vec4(color, alpha);
    }
`

function compileShader(gl, type, source) 
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
}

function attachShaders(gl, vertexShaderSource, fragmentShaderSource)
{
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);


    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
    {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}