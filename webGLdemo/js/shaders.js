//Big note
//If we host this with a real web site we can more conveniently load them with ajax

var simpleVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 texCoords;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec2 texture_coords;

    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
        texture_coords = texCoords;
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
    varying float alpha;

    void main() {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;
        
        texture_coords = aTexCoords;
        normal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;

        vec4 displacement = vec4(normal * aFurLength * (uCurrentShell / uShellCount), 0.0);
        //vec4 displacement = vec4(normal * 0.0, 0.0);
        gl_Position = uProjectionMatrix * (base_position + displacement);
    }
`

var whiteFragmentSharder = `
    void main() 
    {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`

var textureFragmentSharder = `
    precision mediump float;
    
    uniform sampler2D uColorTexture;
    uniform sampler2D uShellAlphaTexture;
    uniform highp float uCurrentShell;

    varying vec2 texture_coords;
    varying vec3 normal;

    void main() 
    {
        vec4 color = texture2D(uColorTexture, texture_coords);
        
        
        float alpha = 1.0;
        if(uCurrentShell > 0.0)
        {
            alpha = texture2D(uShellAlphaTexture, texture_coords).a;
            //alpha = 0.5;

        }
        //gl_FragColor = vec4(abs(normal.x), abs(normal.y), abs(normal.z), 1.0);

        //gl_FragColor = vec4(texture_coords, 0.0, 1.0);
        //gl_FragColor = vec4(color.aaa, 0.5);
        gl_FragColor = vec4(color.rgb, alpha);
        //gl_FragColor = vec4(texture2D(uShellAlphaTexture, texture_coords).rgb, alpha);
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