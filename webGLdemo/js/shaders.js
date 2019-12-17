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

    //lighting
    varying vec3 lightVector;
    varying vec3 halfwayVector;

    void main() {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;

        lightVector = normalize(-1.0 * base_position.xyz);
        halfwayVector = lightVector;

        texture_coords = aTexCoords;
        normal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
        gl_Position = uProjectionMatrix * base_position;
    }
`

var baseFragmentShader = `
    precision mediump float;
        
    uniform sampler2D uColorTexture;
    uniform float uMinShadowFactor;

    //Phong parameters
    uniform float uKa;
    uniform float uKd;
    uniform float uKs;
    uniform float uNs;
    uniform vec3 uLightIntensity;
    uniform vec3 uAmbientIntensity;

    varying vec2 texture_coords;
    varying vec3 normal;


    //lighting
    varying vec3 lightVector;
    varying vec3 halfwayVector;

    void main() 
    {
        vec4 color = texture2D(uColorTexture, texture_coords);
        color = vec4(color.rgb, 1.0);

        vec3 ambientColor = color.rgb * uAmbientIntensity * uKa;
        vec3 diffuseColor = color.rgb * uKd * uLightIntensity * (dot(normalize(normal), normalize(lightVector)));
        float specularLight = pow(dot(normalize(normal), normalize(halfwayVector)), uNs);
        vec3 specularColor = color.rgb * uKs * uLightIntensity * specularLight;

        color = vec4((ambientColor + diffuseColor + specularColor) * uMinShadowFactor, 1.0);

        //gl_FragColor = vec4(specularColor, 1.0);
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
    uniform vec3 uWindSource;
    uniform float uWindIntensity;
    uniform vec3 uModelForce;
    uniform float uMinShadowFactor;


    varying vec2 texture_coords;
    varying vec3 normal;
    varying float netShadowFactor;

    //lighting
    varying vec3 lightVector;
    varying vec3 halfwayVector;

    //varying vec2 displacement_amounts;
    //varying vec3 wind_vector;

    const float MAX_ITERATIONS = 100.0;

    float PI = 3.14159;
    vec2 shellDisplacement(vec3 windVector, vec3 normal)
    {
        float windIntensity = length(windVector);
        
        float windDisplacement = 0.0;
        float normalDisplacement = 0.0;
        for(float shellNumber = 1.0; shellNumber <= MAX_ITERATIONS; shellNumber += 1.0)
        {
            if(shellNumber > uCurrentShell)
            {
                //return vec2(0.0, normalDisplacement);
                return vec2(windDisplacement, normalDisplacement);
            }

            float angle = (min(windIntensity * shellNumber / uShellCount, 1.0) * PI) / (2.0);

            windDisplacement = windDisplacement + sin(angle);
            normalDisplacement = normalDisplacement + cos(angle);
        }

        return vec2(0.0, 0.0);
    }

    void main() {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;
        
        lightVector = normalize(-1.0 * base_position.xyz);
        halfwayVector = lightVector;

        texture_coords = aTexCoords;
        normal = normalize((uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz);

        netShadowFactor = (uCurrentShell / uShellCount) * (1.0 - uMinShadowFactor) + uMinShadowFactor; 

        vec3 windVector = normalize(base_position.xyz - (uViewMatrix * vec4(uWindSource, 1.0)).xyz)  * uWindIntensity;        
        vec3 viewSpaceNetForce = (uViewMatrix * vec4(uModelForce, 0.0)).xyz;

        vec3 totalForce = windVector + viewSpaceNetForce;
        //Projection of wind onto normal
        vec3 vertexForceVector = totalForce - (normal * (dot(totalForce, normal)));
        //wind_vector = vertexWindVector;

        vec2 displacementMultipliers = shellDisplacement(vertexForceVector, normal); 
        //vec2 displacementMultipliers = vec2(0.0, uCurrentShell);
        //displacement_amounts = normalize(displacementMultipliers);
        float shellDistance = aFurLength / uShellCount;

        vec3 displacement = normalize(totalForce) * shellDistance * displacementMultipliers.x + normal * shellDistance * displacementMultipliers.y;
        
        vec4 oldDisplacement = vec4(normalize(normal) * aFurLength * (uCurrentShell / uShellCount), 0.0);

        //gl_Position = uProjectionMatrix * (base_position + oldDisplacement);
        gl_Position = uProjectionMatrix * (base_position + vec4(displacement, 0.0));
        //gl_Position = uProjectionMatrix * base_position;
    }
`

var shellFragmentShader = `
    precision mediump float;
    
    uniform sampler2D uColorTexture;
    uniform sampler2D uShellAlphaTexture;
    uniform highp float uCurrentShell;
    uniform float uColorNoiseFactor;

    //Phong parameters
    uniform float uKa;
    uniform float uKd;
    uniform float uKs;
    uniform float uNs;
    uniform vec3 uLightIntensity;
    uniform vec3 uAmbientIntensity;

    varying vec2 texture_coords;
    varying vec3 normal;
    varying float netShadowFactor;

    //lighting
    varying vec3 lightVector;
    varying vec3 halfwayVector;

    //varying vec2 displacement_amounts;
    //varying vec3 wind_vector;


    void main() 
    {
        vec3 color = texture2D(uColorTexture, texture_coords).rgb;
        
        
        vec4 shellData = texture2D(uShellAlphaTexture, texture_coords);
        float alpha = shellData.a;

        color = mix(color, shellData.rgb, uColorNoiseFactor);

        /*
        vec3 ambientColor = color.rgb * uAmbientIntensity * uKa;
        vec3 diffuseColor = color.rgb * uKd * uLightIntensity * (dot(normalize(normal), normalize(lightVector)));
        float specularLight = pow(dot(normalize(normal), normalize(halfwayVector)), uNs);
        vec3 specularColor = color.rgb * uKs * uLightIntensity * specularLight;

        color = vec4((ambientColor + diffuseColor + specularColor) * netShadowFactor, 1.0);
        */
        color = color * netShadowFactor;

        //gl_FragColor = vec4(abs(normal.x), abs(normal.y), abs(normal.z), 1.0);

        //gl_FragColor = vec4(texture_coords, 0.0, 1.0);
        //gl_FragColor = vec4(color.aaa, 0.5);
        

        //gl_FragColor = vec4(abs(displacement_amounts.x), abs(displacement_amounts.x), 0.0, 0.1);
        //gl_FragColor = vec4(abs(wind_vector.x), abs(wind_vector.y), abs(wind_vector.z) , 1.0);
        //gl_FragColor = vec4(abs(normal.x), abs(normal.y), abs(normal.z) , 1.0);


        gl_FragColor = vec4(color.rgb, alpha);
        
        
        //gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        //gl_FragColor = vec4(texture2D(uShellAlphaTexture, texture_coords).rgb, alpha);
    }
`

var finVertexShader = `
    attribute vec4 aVertexPosition;
    attribute vec2 aFinTexCoords;
    attribute vec2 aColorTexCoords;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;
    uniform int uShouldModifyFinAlpha;

    varying vec2 finTexCoords;
    varying vec2 colorTexCoords;
    varying float alphaModifier;

    //lighting
    varying vec3 lightVector;
    varying vec3 halfwayVector;
    varying vec3 normal;

    void main() 
    {
        vec4 base_position = uViewMatrix * uModelMatrix * aVertexPosition;

        lightVector = normalize(-1.0 * base_position.xyz);
        halfwayVector = lightVector;

        finTexCoords = aFinTexCoords;
        colorTexCoords = aColorTexCoords;

        normal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
        vec3 eyeVec = vec3(0, 0, 1);
        alphaModifier = max(float(uShouldModifyFinAlpha), 2.0 * abs(dot(normalize(normal), eyeVec)) - 1.0);
        //alphaModifier = 1.0;
        gl_Position = uProjectionMatrix * base_position;
    }
`

var finFragmentShader = `
    precision mediump float;

    varying vec2 finTexCoords;
    varying vec2 colorTexCoords;
    varying highp float alphaModifier; 

    uniform sampler2D uFinTexture;
    uniform sampler2D uColorTexture;
    uniform float uColorNoiseFactor;
    uniform float uMinShadowFactor;

    //Phong parameters
    uniform float uKa;
    uniform float uKd;
    uniform float uKs;
    uniform float uNs;
    uniform vec3 uLightIntensity;
    uniform vec3 uAmbientIntensity;
    
    //lighting
    varying vec3 lightVector;
    varying vec3 halfwayVector;
    varying vec3 normal;

    void main()
    {
        vec3 color = texture2D(uColorTexture, colorTexCoords).rgb;
        
        vec4 textureData = texture2D(uFinTexture, finTexCoords);
        color = mix(color, textureData.rgb, uColorNoiseFactor);

        vec3 ambientColor = color.rgb * uAmbientIntensity * uKa;
        vec3 diffuseColor = color.rgb * uKd * uLightIntensity * (abs(dot(normalize(normal), normalize(lightVector))));
        float specularLight = pow(abs(dot(normalize(normal), normalize(halfwayVector))), uNs);
        vec3 specularColor = color.rgb * uKs * uLightIntensity * specularLight;

        color = ambientColor + diffuseColor + specularColor;
        
        float shadowFactor = finTexCoords.y * (1.0 - uMinShadowFactor) + uMinShadowFactor;
        color = color * shadowFactor;
        float alpha = alphaModifier * textureData.a;
        gl_FragColor = vec4(color, alpha);
        //gl_FragColor = texture2D(uFinTexture, finTexCoords);
        //gl_FragColor = vec4(alphaModifier, alphaModifier, alphaModifier, 1.0);
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