class Layer {
    constructor() {
        this._layer = [];
        this._dirs = [];
    }

    // getters and setters
    get layer() {
        return this._layer;
    }

    set layer(layer) {
        this._layer = layer;
    }

    get dirs() {
        return this._dirs;
    }

    set dirs(dirs) {
        this._dirs = dirs;
    }

    // methods
    addToLayer(row, val) {
        this._layer[row].push(val);
    }

    addToDir(row, val) {
        this._dirs[row].push(val);
    }
}

function generateLayers(layerDist, layerDim, depth, threshold, previousLayers, allLayers) {
    //console.log(depth);
    // base cases
    if (depth === 0) {
        return null;
    }

    if (depth === 1) {

        previousLayers = new Layer();

        for (var px = 0; px < layerDim; px++) {
            previousLayers.layer[px] = [];
            previousLayers.dirs[px] = [];
            for (var py = 0; py < layerDim; py++) {
                previousLayers.layer[px].push(Math.random() < threshold);

                if (!previousLayers.layer[px][py]) {
                    previousLayers.dirs[px].push([0, 0, 0]);
                    continue;
                }

                var x = Math.random();
                var y = Math.random();
                var z = Math.random();

                var mag = Math.sqrt(x * x + y * y + z * z);

                x /= mag;
                y /= mag;
                z /= mag;

                previousLayers.dirs[px].push([Math.random(), Math.random(), Math.random()]);
            }
        }

        allLayers.push(previousLayers);
        return previousLayers;
    }

    previousLayers = generateLayers(layerDist, layerDim, depth - 1, threshold, previousLayers, allLayers);

    if (previousLayers == null) {
        console.log("uh oh something went wrong...");
        return null;
    }

    var newLayer = new Layer();

    for (var px = 0; px < layerDim; px++) {
        newLayer.layer[px] = [];
        newLayer.dirs[px] = [];
        for (var py = 0; py < layerDim; py++) {
            newLayer.layer[px].push(false);
            newLayer.dirs[px].push([0,0,0]);
        }
    }

    for (var px = 0; px < layerDim; px++) {
        for (var py = 0; py < layerDim; py++) {
            if (!previousLayers.layer[px][py]) {
                continue;
            }

            // find_intersection(layerDist, previousLayers, newLayer);
            // find the intersection point
            var t = -layerDist / previousLayers.dirs[px][py][2];

            // only need the x,y values
            var x = Math.floor(px + previousLayers.dirs[px][py][0] * t);
            var y = Math.floor(py + previousLayers.dirs[px][py][1] * t);

            if (x < 0 || x >= layerDim || y < 0 || y >= layerDim) {
                continue;
            }

            newLayer.layer[x][y] = true;
            newLayer.dirs[x][y] = previousLayers.dirs[px][py];
        }
    }

    allLayers.push(newLayer);
    return newLayer;
}

function pGenFur(layerDist, layerDim, depth, threshold, previousLayers, allLayers) {
    generateLayers(layerDist, layerDim, depth, threshold, previousLayers, allLayers);

    allLayers.forEach( item => {
        console.log(item);
    });
}