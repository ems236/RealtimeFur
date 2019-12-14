function generateFurMap(mapSize, kernelSize) {
    var uniformNoise = (() => {
        var noise = new Array(mapSize);
        for (var i = 0; i < mapSize; i++) {
            var innerNoiseArray = new Array(mapSize);
            for (var j = 0; j < mapSize; j++) {
                innerNoiseArray[j] = Math.random() * 255;
            }
            noise[i] = innerNoiseArray;
        }
        return noise;
    })();

    // gaussian filter
    var filteredNoise = (() => {
        // get a deep copy
        var toFilter = new Array(uniformNoise.length);

        // average over kernel
        var edge = Math.floor(kernelSize / 2);
        console.log("edge: " + edge);
        for (var px = 0; px < toFilter.length; px++) {
            toFilter[px] = new Array(uniformNoise.length).fill(0);
            for (var py = 0; py < toFilter.length; py++) {
                var count = 0;


                for (var ttb = -edge; ttb <= edge; ttb++) {
                    if (ttb + px < 0 || ttb + px >= uniformNoise.length) {
                        continue;
                    }


                    for (var rtl = -edge; rtl <= edge; rtl++) {
                        if (rtl + py < 0 || rtl + py >= uniformNoise.length) {
                            continue;
                        }


                        toFilter[px][py] += uniformNoise[ttb + px][rtl + py];
                        count++;
                    }
                }

                if (count !== 0)
                    toFilter[px][py] /= count;

            }
        }
        return toFilter;
    })();

    return filteredNoise;
}

function guassBlur5x5Noise(noiseSize)
{
    var noise = [];
    for (var i = 0; i < noiseSize; i++) {
        noise.push([]);
        for (var j = 0; j < noiseSize; j++) 
        {
            var rand = Math.random() * 255;
            noise[i].push(rand);
        }
    }

    var kernel = [[1, 4, 6, 4, 1], [4, 16, 24, 16, 4], [6, 24, 36, 24, 6], [4, 16, 24, 16, 4], [1, 4, 6, 4, 1]];
    var scale = 256.0;

    var filteredNoise = [];
    for(var row = 0; row < noiseSize; row++)
    {
        filteredNoise.push(noise[row].slice(0));
    }

    for(var x = 0; x < noiseSize; x++)
    {
        for(var y = 0; y < noiseSize; y++)
        {
            var sum = 0;

            for(var xOffset = -2; xOffset <= 2; xOffset++)
            {
                for(var yOffset = -2; yOffset <= 2; yOffset++)
                {
                    var kernelVal = kernel[xOffset + 2][yOffset + 2];
                    var pointx = bound(x + xOffset, 0, noiseSize - 1);
                    var pointy = bound(y + yOffset, 0, noiseSize - 1);

                    sum += kernelVal * noise[pointx][pointy];
                }
            }

            filteredNoise[x][y] = bound(sum / scale, 0, 255);
        }
    }
    
    return filteredNoise;
}

function bound(val, min, max)
{
    return Math.max(min, Math.min(val, max));
}

function sampleFur(threshold, data) {
    return data.map(row => 
        {
            var filtered = row.map(item => item > threshold ? 255 : 0);
            return filtered;
        }
    );
}

function randomSample(data, count)
{
    var copy = data.slice(0);
    var sample = [];
    for(var i = 0; i < count; i++)
    {
        var rand = randomInRange(0, copy.length - 1);
        sample.push(copy[rand]);
        if(!copy[rand] && copy[rand] != 0)
        {
            var ayyy = "lmao";
        }
        copy.splice(rand, 1);
    }

    return sample;
}

//Curliness and density range from 0 to 1.
function finTextureData(size, density, curliness)
{
    //A particle system approach to generating texture data for the fins
    var finData = [];
    var possibleStarts = [];
    for(var row = 0; row < size; row++)
    {
        finData.push(new Array(size));
        finData[row].fill(0);

        possibleStarts.push(row);
    }

    var particleCount = Math.round(density * size);
    var startPoints = randomSample(possibleStarts, particleCount);

    for(var particleNumber = 0; particleNumber < particleCount; particleNumber++)
    {
        var starty = startPoints[particleNumber];
        var startx = 0;

        var normal = vec2.create();
        vec2.set(normal, 1, 0);
        var sign = Math.random() > 0.5 ? 1 : -1;

        var curlDeviation = mat2.create();
        //By last particle cast, the angle will have deviated to 2PI / curliness
        mat2.fromRotation(curlDeviation, sign * (2 * 3.1415 * curliness) / size);

        //As soon as it rotates by PI / 2, it's covered all the distance it's going to cover. 
        //need to modify particle distance so the texture fills all the way to the end
        var castDistance = 1;
        if(curliness > 0.25)
        {
            castDistance = 4 * (1 / curliness);
        }

        //this essentially needs to rasterize which is not nice

        for(var castNumber = 1; castNumber < size; castNumber++)
        {
            var endX = startx + castDistance * normal[0];
            var endY = starty + castDistance * normal[1];

            rasterize(startx, starty, endX, endY, finData);

            startx = endX;
            starty = endY;
            //deviate the normal by some amount of curliness.
            vec2.transformMat2(normal, normal, curlDeviation);
        }
    }

    return finData;
}

function rasterize(startx, starty, endx, endy, data)
{
    if(Math.abs((endx - startx)) > Math.abs((endy - starty)))
    {
        var slope = (endy - starty) / (endx - startx);
        var y = starty;
        for(var x = Math.round(startx); x <=endx; x++)
        {
            var ypos = Math.round(y);
            if(isInRange(x, 0, data.length - 1) && isInRange(ypos, 0, data.length - 1))
            {
                data[x][ypos] = 255;
            }
            y += slope;
        }
    }
    else
    {
        var inverseSlope = (endx - startx) / (endy - starty);
        var x = startx;
        for(var y = Math.round(starty); y <=endy; y++)
        {
            var xpos = Math.round(x); 
            
            if(isInRange(xpos, 0, data.length - 1) && isInRange(y, 0, data.length - 1))
            {
                data[xpos][y] = 255;
            }
            x += inverseSlope;
        }
    }
}

function isInRange(val, min, max)
{
    return val >= min && val <= max;
}

function randomInRange(min, max)
{
    return Math.round(Math.random() * (max - min) + min);
}