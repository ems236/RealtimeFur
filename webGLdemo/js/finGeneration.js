function generateFins(eyeVec, sharedTriangles, objectData, shouldRenderAll, subFinCount, windPosition, windIntensity, movementForce, sillhouetteThreshold, finLengthModifier)
{
    var finVertices = [];
    var finFaces = [];
    var finTexCoords = [];
    var colorTexCoords = [];
    var finNormals = [];

    var finData = {
        finVertices: finVertices,
        finFaces: finFaces,
        finTexCoords: finTexCoords,
        colorTexCoords: colorTexCoords,
        finNormals: finNormals
    }

    for(var edgeIndex = 0; edgeIndex < sharedTriangles.length; edgeIndex++)
    {
        var sharedTriangle = sharedTriangles[edgeIndex];

        var norm1 = vec4.create();
        vec4.normalize(norm1, sharedTriangle.norm1);

        var norm2 = vec4.create();
        vec4.normalize(norm2, sharedTriangle.norm2);

        var norm1DotEye = vec4.dot(norm1, eyeVec);
        var norm2DotEye = vec4.dot(norm2, eyeVec);
        
        if(shouldRenderAll || isSillhouette(norm1DotEye, norm2DotEye, sillhouetteThreshold))
        {
            extrudeEdge(sharedTriangle, finData, objectData, subFinCount, windPosition, windIntensity, movementForce, finLengthModifier);
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

function isSillhouette(norm1DotEye, norm2DotEye, sillhouetteThreshold)
{
    var isEitherBelowThreshold = Math.abs(norm1DotEye) < sillhouetteThreshold || Math.abs(norm2DotEye) < sillhouetteThreshold;
    return norm1DotEye > 0 != norm2DotEye > 0 || isEitherBelowThreshold;
}

function extrudeEdge(sharedTriangle, finData, objectData, subFinCount, windPosition, windIntensity, movementForce, finLengthModifier)
{
    //Fins look longer than shells because they don't really fade so much, so shorten them a bit.
    const FIN_LENGTH_MODIFIER = 0.75;

    //Get vertex is defined in GlDemo.js
    var v1 = getVertex(sharedTriangle.sharedv1, objectData.position);
    var v1Normal = getVertex(sharedTriangle.sharedv1, objectData.normal);
    vec3.normalize(v1Normal, v1Normal);

    var v2 = getVertex(sharedTriangle.sharedv2, objectData.position);
    var v2Normal = getVertex(sharedTriangle.sharedv2, objectData.normal);
    vec3.normalize(v2Normal, v2Normal);


    v1Locations = subFinDisplacementsFor(v1, v1Normal, windPosition, windIntensity, movementForce, subFinCount, objectData.furLength[sharedTriangle.sharedv1] * finLengthModifier);
    v2Locations = subFinDisplacementsFor(v2, v2Normal, windPosition, windIntensity, movementForce, subFinCount, objectData.furLength[sharedTriangle.sharedv2] * finLengthModifier);

    var utexCoords = uTexCoordsFor(v1, v2);
    var currentColorTexCoords = {
        v1: getTexCoords(sharedTriangle.sharedv1, objectData.texCoord),
        v2: getTexCoords(sharedTriangle.sharedv2, objectData.texCoord)
    }
    
    //Draw the fin
    var startIndex = finData.finVertices.length / 3;
    
    finData.finVertices.push(v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]);
    finData.finTexCoords.push(utexCoords.left, 1 / subFinCount, utexCoords.right, 1 / subFinCount);
    finData.colorTexCoords.push(currentColorTexCoords.v1.u, currentColorTexCoords.v1.v, currentColorTexCoords.v2.u, currentColorTexCoords.v2.v);

    for(var subfinIndex = 1; subfinIndex <= subFinCount; subfinIndex++)
    {
        var v3 = v1Locations[subfinIndex];
        var v4 = v2Locations[subfinIndex];
        finData.finVertices.push(v3[0], v3[1], v3[2], v4[0], v4[1], v4[2]);
        finData.finTexCoords.push(utexCoords.left, subfinIndex / subFinCount, utexCoords.right, subfinIndex / subFinCount);
        finData.colorTexCoords.push(currentColorTexCoords.v1.u, currentColorTexCoords.v1.v, currentColorTexCoords.v2.u, currentColorTexCoords.v2.v);

        finData.finFaces.push(startIndex, startIndex + 1, startIndex + 2, startIndex + 2, startIndex + 3, startIndex + 1);
        startIndex += 2;
    }

    //Really don't care much about the sign
    //Would not do this but it's really easier to duplicate data than to mess with stride. :(
    //Normal is approximated rather than accounting for wind.
    var normal = sharedTriangle.finNormal;
    for(var finVertex = 0; finVertex < 2 * (1 + subFinCount); finVertex++)
    {
        finData.finNormals.push(normal[0], normal[1], normal[2]);
    }
}

function subFinDisplacementsFor(vertex, normal, windSource, windIntensityModifer, movementForce, subFinCount, furLength)
{
    var locations = [vertex];
    var windVector = vec3.create();
    vec3.subtract(windVector, vertex, windSource);
    vec3.normalize(windVector, windVector);
    vec3.scale(windVector, windVector, windIntensityModifer);

    var forceVector = vec3.create();
    vec3.add(forceVector, movementForce, windVector);

    var unitForceVector = vec3.create();
    vec3.normalize(unitForceVector, forceVector);

    var vertexForceVector = vec3.create();
    var scaledNormal = vec3.create();
    vec3.scale(scaledNormal, normal, vec3.dot(forceVector, normal));
    vec3.subtract(vertexForceVector, forceVector, scaledNormal);

    var windIntensity = vec3.length(vertexForceVector);
    var shellDistance = furLength / subFinCount;

    for(var subFinIndex = 1; subFinIndex <= subFinCount; subFinIndex++)
    {
        var previousVertex = locations[locations.length - 1];
        
        var angle = (Math.min(windIntensity * subFinIndex / subFinCount, 1.0) * PI) / (2.0);
        var windDisplacement =  shellDistance * Math.sin(angle);
        var normalDisplacement = shellDistance * Math.cos(angle);

        var windVectorDisplacement = vec3.create();
        vec3.scale(windVectorDisplacement, unitForceVector, windDisplacement);

        var normVectorDisplacement = vec3.create();
        vec3.scale(normVectorDisplacement, normal, normalDisplacement);

        var nextVert = vec3.create();
        vec3.add(nextVert, previousVertex, windVectorDisplacement);
        vec3.add(nextVert, nextVert, normVectorDisplacement);

        locations.push(nextVert);
    }

    return locations;
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