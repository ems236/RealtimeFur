class Camera
{
    constructor(position, lookat, up)
    {
        this.position = position;
        this.lookat = lookat;
        this.up = up;
        
    }

    viewMatrix()
    {
        var view = mat4.create();

        var n = vec3.create();
        vec3.subtract(n, this.position, this.lookat);
        vec3.normalize(n, n);

        var u = vec3.create();
        vec3.cross(u, this.up, n);
        vec3.normalize(u, u);

        var v = vec3.create();
        vec3.cross(v, n, u);
        vec3.normalize(v, v);

        var translation = mat3.fromValues(u[0], v[0], n[0], u[1], v[1], n[1], u[2], v[2], n[2]);
        var translation_vec = vec3.create();

        vec3.transformMat3(translation_vec, this.position, translation);
        vec3.scale(translation_vec, translation_vec, -1.0);

        return mat4.fromValues(u[0], v[0], n[0], 0, u[1], v[1], n[1], 0, u[2], v[2], n[2], 0, translation_vec[0], translation_vec[1], translation_vec[2], 1);
    }


}