class Camera
{
    //position is z position
    constructor(radius, lookat, up)
    {
        this.lookat = lookat;
        this.up = up;
        
        this.latitude = PI / 2;
        this.longitude = PI / 2;
        this.radius = radius;
    }

    viewMatrix()
    {
        var view = mat4.create();

        var currentPos = this.position();

        console.log(currentPos);

        var n = vec3.create();
        vec3.subtract(n, currentPos, this.lookat);
        vec3.normalize(n, n);

        var u = vec3.create();
        vec3.cross(u, this.up, n);
        vec3.normalize(u, u);

        var v = vec3.create();
        vec3.cross(v, n, u);
        vec3.normalize(v, v);

        var translation = mat3.fromValues(u[0], v[0], n[0], u[1], v[1], n[1], u[2], v[2], n[2]);
        var translation_vec = vec3.create();

        vec3.transformMat3(translation_vec, currentPos, translation);
        vec3.scale(translation_vec, translation_vec, -1.0);

        return mat4.fromValues(u[0], v[0], n[0], 0, u[1], v[1], n[1], 0, u[2], v[2], n[2], 0, translation_vec[0], translation_vec[1], translation_vec[2], 1);
    }

    position()
    {
        var x = this.radius * Math.sin(this.latitude) * Math.cos(this.longitude);
        var y = this.radius * Math.cos(this.longitude);
        var z = this.radius * Math.sin(this.latitude) * Math.sin(this.longitude);

        return vec3.fromValues(x, y, z);
    }

    changeLatitude(isPositive)
    {
        const step = 0.05;
        const sign = isPositive ? 1.0 : -1.0;
        this.latitude = clamp(this.latitude + (sign * step), 0, PI);
    }

    changeLongitude(isPositive)
    {
        const step = 0.05;
        const sign = isPositive ? 1.0 : -1.0;
        this.longitude = this.longitude + (sign * step) % 2 * PI;
    }
}