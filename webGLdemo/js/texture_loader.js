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
    image.crossOrigin = "*";
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