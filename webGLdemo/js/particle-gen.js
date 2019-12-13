function genParticles(boxDim, numLayers, numParts) {
    var layers = {};
    var area = boxDim * boxDim;

    // init layers
    for (var i = 0; i < numLayers; i++) {
        layers[i] = {};
        layers[i]['shell'] = new Array(area).fill(0);
        layers[i]['dirs'] = new Array(area).fill(0);
    }

    for (var px = 0; px < boxDim; px++) {
        for (var py = 0; py < boxDim; py++) {

        }
    }
}