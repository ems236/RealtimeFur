function load_texture(gl, scene, image_name)
{
    const texture = gl.createTexture();
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    const temp_texture = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                temp_texture);

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = function()
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        scene.redraw();
    }
    image.src = "http://ems236.github.io/RenderingFur/webGLdemo/textures/" + image_name;

    return texture;
}

function textureFromData(gl, data, size)
{
    const texture = gl.createTexture();
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = size;
    const height = size;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    const byteData = new Uint8Array(data);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                byteData);
    gl.generateMipmap(gl.TEXTURE_2D);
    
    return texture;
}

//I cannot make a single channel texture for the life of me
function padAlphaData(data)
{
    var flat = data.flat();
    var newData = [];
    for(var i = 0; i < flat.length; i++)
    {
        newData.push(flat[i]);
        newData.push(0);
        newData.push(0);
        newData.push(flat[i]);
    }

    return newData;
}