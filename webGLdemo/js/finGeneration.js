function generateFins(eyeVec, normalMatrix, sharedTriangles, objectData, shouldFilter)
{
    var finVertices = [];
    var finFaces = [];
    var finTexCoords = [];
    var colorTexCoords = [];
    var finNormals = [];

    for(var edgeIndex = 0; edgeIndex < sharedTriangles.length; edgeIndex++)
    {
        var sharedTriangle = sharedTriangles[edgeIndex];


        var norm1 = vec4.create();
        vec4.transformMat4(norm1, sharedTriangle.norm1, normalMatrix);
        vec4.normalize(norm1, norm1);

        var norm2 = vec4.create();
        vec4.transformMat4(norm2, sharedTriangle.norm2, normalMatrix);
        vec4.normalize(norm2, norm2);

        var norm1DotEye = vec4.dot(norm1, eyeVec);
        var norm2DotEye = vec4.dot(norm2, eyeVec);
        
        //Should also add a threshold for dot prod.
        if(!shouldFilter || isSillhouette(norm1DotEye, norm2DotEye))
        {
            extrudeEdge(sharedTriangle, finVertices, finFaces, finTexCoords, colorTexCoords, finNormals, objectData);
        }
    }

    return {
        positions: finVertices,
        faces: finFaces,
        finTexCoords: finTexCoords,
        colorTexCoords: colorTexCoords,
        normals: finNormals
    }
}

function isSillhouette(norm1DotEye, norm2DotEye)
{
    const SILLHOUETTE_THRESHOLD = 0.1;
    var isEitherBelowThreshold = Math.abs(norm1DotEye) < SILLHOUETTE_THRESHOLD || Math.abs(norm2DotEye) < SILLHOUETTE_THRESHOLD;
    return norm1DotEye > 0 != norm2DotEye > 0 || isEitherBelowThreshold;
}

function extrudeEdge(sharedTriangle, finVertices, finFaces, finTexCoords, colorTexCoords, finNormals, objectData)
{
    //Draw the fin
    var startIndex = finVertices.length / 3;
            
    //Get vertex is defined in GlDemo.js
    var v1 = getVertex(sharedTriangle.sharedv1, objectData.position);
    var v1FurOffset = vec3.create();
    vec3.normalize(v1FurOffset, v1);
    vec3.scale(v1FurOffset, v1FurOffset, objectData.furLength[sharedTriangle.sharedv1]);
    var v3 = vec3.create();
    vec3.add(v3, v1, v1FurOffset);


    var v2 = getVertex(sharedTriangle.sharedv2, objectData.position);
    var v2FurOffset = vec3.create();
    vec3.normalize(v2FurOffset, v2);
    vec3.scale(v2FurOffset, v2FurOffset, objectData.furLength[sharedTriangle.sharedv2]);
    var v4 = vec3.create();
    vec3.add(v4, v2, v2FurOffset);

    var utexCoords = uTexCoordsFor(v1, v2);

    finVertices.push(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2], v3[0], v3[1], v3[2], v4[0], v4[1], v4[2]);
    finFaces.push(startIndex, startIndex + 1, startIndex + 2, startIndex + 2, startIndex + 3, startIndex + 1);
    finTexCoords.push(utexCoords.left, 0, utexCoords.right, 0, utexCoords.left, 1, utexCoords.right, 1);

    var currentColorTexCoords = {
        v1: getTexCoords(sharedTriangle.sharedv1, objectData.texCoord),
        v2: getTexCoords(sharedTriangle.sharedv2, objectData.texCoord)
    }

    colorTexCoords.push(
        currentColorTexCoords.v1.u, currentColorTexCoords.v1.v
        , currentColorTexCoords.v2.u, currentColorTexCoords.v2.v
        , currentColorTexCoords.v1.u, currentColorTexCoords.v1.v
        , currentColorTexCoords.v2.u, currentColorTexCoords.v2.v);

    //Really don't care much about the sign
    //Would not do this but it's really easier to duplicate data than to mess with stride.
    var normal = sharedTriangle.finNormal;
    for(var finVertex = 0; finVertex < 4; finVertex++)
    {
        finNormals.push(normal[0], normal[1], normal[2]);
    }
}

function uTexCoordsFor(v1, v2)
{
    var edgeLength = vec3.distance(v1, v2) * 3;
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