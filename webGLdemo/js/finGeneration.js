generateFins(eyeVec, normalMatrix, sharedTriangles, positions, normals, furLength)
{
    var finVertices = [];
    var finFaces = [];
    var finTexCoords = [];

    for(var edgeIndex = 0; edgeIndex < sharedTriangles.length; edgeIndex++)
    {
        var sharedTriangle = sharedTriangles[edgeIndex];

        var norm1 = vec4.create();
        vec4.transformMat4(norm1, sharedTriangle.norm1, normalMatrix);

        var norm2 = vec4.create();
        vec4.transformMat4(norm2, sharedTriangle.norm2, normalMatrix);

        var norm1DotEye = vec4.dot(norm1, eyeVec);
        var norm2DotEye = vec4.dot(norm2, eyeVec);
        
        //Should also add a threshold for dot prod.
        if(norm1DotEye > 0 != norm2DotEye > 0)
        {
            extrudeEdge(sharedTriangle, finVertices, finFaces, finTexCoords, positions, normals, furLength);
        }
    }

    return {
        positions: finVertices,
        faces: finFaces,
        texCoords: finTexCoords
    };
}

function extrudeEdge(sharedTriangle, finVertices, finFaces, finTexCoords, positions, normals, furLength)
{
    //Draw the fin
    var startIndex = finVertices.length / 3;
            
    //Get vertex is defined in GlDemo.js
    var v1 = getVertex(sharedTriangle.sharedv1, positions);
    var v1FurOffset = getVertex(sharedTriangle.sharedv1, normals)
    vec3.normalize(v1FurOffset, v1FurOffset);
    vec3.scale(v1FurOffset, v1FurOffset, furLength[sharedTriangle.sharedv1]);
    var v3 = vec3.create();
    vec3.add(v3, v1, v1FurOffset);


    var v2 = getVertex(sharedTriangle.sharedv2, positions);
    var v2FurOffset = getVertex(sharedTriangle.sharedv2, normals)
    vec3.normalize(v2FurOffset, v2FurOffset);
    vec3.scale(v2FurOffset, v2FurOffset, furLength[sharedTriangle.sharedv2]);
    var v4 = vec3.create();
    vec3.add(v4, v2, v2FurOffset);

    var utexCoords = uTexCoordsFor(v1, v2);

    finVertices.push(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2], v4[0], v4[1], v4[2]);
    finFaces.push(startIndex, startIndex + 1, startIndex + 2, startIndex + 2, startIndex + 3, startIndex + 1);
    finTexCoords.push(utexCoords.left, 0, utexCoords.right, 0, utexCoords.left, 1, utexCoords.right, 1);
}

function uTexCoordsFor(v1, v2)
{
    var edge = vec3.create(); 
    vec3.subtract(edge, v2, v1);

    var edgeLength = vec3.magnitude(edge);
    var start = randomInRange(0, 1 - edgeLength);
    return {
        left: start,
        right: start + edgeLength
    }
}

function randomInRange(min, max)
{
    return Math.round(Math.random() * (max - min) + min);
}