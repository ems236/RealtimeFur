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

        for (var px = 0; px < toFilter.length; px++) {
            toFilter[px] = new Array(uniformNoise.length).fill(0);
            for (var py = 0; py < toFilter.length; py++) {
                var count = 0;

                for (var rtl = -edge; rtl <= edge; rtl++) {
                    if ((rtl + py >= 0) && (rtl + py < kernelSize)) {
                        for (var ttb = -edge; ttb <= edge; ttb++) {
                            if ((ttb + px >= 0) && (ttb + px < kernelSize)) {
                                toFilter[px][py] += uniformNoise[ttb + px][rtl + py];
                                count++;
                            }
                        }
                    }
                }

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
    console.log(noise);
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

function sampleFur(threshold, opmap) {
    return opmap.map(out => {
        return out.map(item => item > threshold ? item : 0);
    });
}