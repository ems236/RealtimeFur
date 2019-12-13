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

function sampleFur(threshold, opmap) {
    return opmap.map(out => {
        return out.map(item => item > threshold ? item : 0);
    });
}