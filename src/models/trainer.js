const cv = require('opencv4nodejs');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs-extra');

const epoch = 300;
const batches = 20;

module.exports = class Trainer {
    constructor(trainingData, size) {
        this.trainingData = trainingData;

        this.size = size;
        this.letterData = {};
        this.weightData = {};
        this.letterDatabase = [];

        this.AImodel = null;
    }

    buildCharWeights() {
        this.letterDatabase.forEach((char, index) => {
            this.weightData[char.toString()] = index;
        });
    }

    saveModel(onSave) {
        if(this.AImodel == null) return onSave('Meow brain not initialized');
        
        fs.ensureFile('./brains/meow_tail.json').then(() => {
            this.AImodel.save('file://./brains/meow_brain').then(() => {
                fs.writeJSON('./brains/meow_tail.json', this.letterDatabase).then(() => {
                    return onSave();
                });
            }).catch((err) => {
                return onSave(err);
            });
        });
    }

    loadModel(onLoad) {
        if(this.AImodel != null) return onLoad('Meow brain already initialized');
        fs.readJSON('./brains/meow_tail.json').then((jsonData) => {
            this.letterDatabase = jsonData;

            tf.loadLayersModel('file://./brains/meow_brain/model.json').then((mdl) => {
                this.AImodel = mdl;
                return onLoad();
            }).catch((err) => {
                return onLoad(err);
            });
        });
    }

    predict(slide, onDone) {
        cv.imreadAsync(slide, (err, img) => {
            if(err) throw new Error(err);

            let regions = this.splitImage(img);
            if(regions == null) return onDone(null);

            let result = [];

            let total = regions.length;
            let done = () => {
                total--;
                if(total <= 0) return onDone(result);
            };

            for(let i = 0; i < regions.length; i++) {
                let region = regions[i];

                let mat = img.getRegion(new cv.Rect(region[0], region[1], region[2], region[3]));
                mat = mat.resize(new cv.Size(this.size, this.size)); // Scale all to 28x28

                let x = new tf.tensor3d([this.convertRGBData(mat)]);
                let prediction = this.AImodel.predict(x);

                prediction.data().then((lePrediction) => {
                    let magic = Array.from(lePrediction).map((p, i) => {
                        return {
                            probability: p,
                            value: i
                        };
                    }).sort(function(a,b){
                        return b.probability - a.probability;
                    }).slice(0, 2);
                    
                    let chosenOne = magic[0];
                    result.push(this.letterDatabase[chosenOne.value]);

                    return done();
                });
            }
        });
    }

    buildTrainModel(done) {
        // Build weights
        this.buildCharWeights(); // Todo: Is it always the same?

        // Keras or whatever this is
        this.AImodel = tf.sequential();

        this.AImodel.add(tf.layers.flatten({inputShape: [this.size, this.size]})); // Size of the training samples
        this.AImodel.add(tf.layers.dense({units: 128, activation: 'relu'})); // 128 layers
        this.AImodel.add(tf.layers.dense({units: Object.keys(this.weightData).length, activation: 'softmax'})); // Not entirely sure

        this.AImodel.compile({optimizer: 'adam', loss: 'sparseCategoricalCrossentropy', metrics: 'accuracy'});

        // All pixel data to, equivelant to the letter weight
        // [[123,123123,123],[234,2342,3423,4],[234,23,4,2,34,2],[12,234,234,2]] => [1 5 7 9]

        let trainData = [];
        let weights = [];

        Object.keys(this.trainingData).forEach((slide) => {
            let answer = this.trainingData[slide];
            let w = [];
            for(let i = 0; i < answer.length; i++) {
                let char = answer[i];

                trainData.push(this.letterData[char + '_' + slide]);
                weights.push(parseInt(this.weightData[char]));
            }
        });

        let x = new tf.tensor3d(trainData);
        let y = new tf.tensor1d(weights);

        this.AImodel.fit(x, y, {epochs: epoch, batchSize: batches, verbose: 1}).then(() => {
            tf.tidy(() => {
                return done();
            });
        }).catch((err) => {
            console.warn(err);
        });
    }

    rgbToInt(r, g, b){
        // Convert it to a 0 -> 1 value
        return (r * 299/1000 + g * 587/1000 + b * 114/1000) / 255;
    }

    prepareData(callback) {
        let total = Object.keys(this.trainingData).length;
        let onDone = () => {
            total--;
            if(total <= 0) return callback();
        };
        
        Object.keys(this.trainingData).forEach((slide, indx) => {
            cv.imreadAsync(`./train_data/img/${slide}`, (err, img) => {
                if(err) throw new Error(err);

                let regions = this.splitImage(img);
                if (regions == null) throw new Error(`Invalid training data ${slide}, could not split :(`);

                for(let i = 0; i < regions.length; i++) {
                    let letter = this.trainingData[slide][i];
                    let region = regions[i];
        
                    let mat = img.getRegion(new cv.Rect(region[0], region[1], region[2], region[3]));
                    mat = mat.resize(new cv.Size(this.size, this.size)); // Scale all to 28x28
        
                    this.letterData[letter + '_' + slide] = this.convertRGBData(mat);
                    if(this.letterDatabase.indexOf(letter) == -1) this.letterDatabase.push(letter);
                }

                return onDone();
            });
        });
    }

    splitImage(img) {
        let gray = img.cvtColor(cv.COLOR_BGR2GRAY);
        let smooth = gray.gaussianBlur(new cv.Size(3, 3), 0, 0 );

        let dilation_size = 4;
        let dilateStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2*dilation_size + 1, 2*dilation_size+1), new cv.Point( dilation_size, dilation_size ));
        smooth = smooth.erode(dilateStructure);

        let adaptTresh = smooth.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 185, 13);
        
        let borderSize = 5;
        adaptTresh.drawRectangle(new cv.Point2(borderSize / 2, borderSize / 2), new cv.Point2(img.sizes[1] - borderSize / 2, img.sizes[0] - borderSize / 2), 
                             new cv.Vec3(255, 255, 255), borderSize);

        let inv = adaptTresh.sub(gray);

        dilation_size = 0.3;
        dilateStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2*dilation_size + 1, 2*dilation_size+1), new cv.Point( dilation_size, dilation_size ));
        inv = inv.erode(dilateStructure);

        let finalTresh = inv.threshold(1, 10, cv.THRESH_BINARY_INV);
        let contours = finalTresh.findContours(cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
        let regions = [];
        
        contours.forEach((countour) => {
            let hull = countour.convexHull(false);
            if (hull.area <= 100) return;

            let box = hull.boundingRect();
            regions.push([box.x, box.y, box.width, box.height]);
        });

        // sort hulls using X
        regions.sort((a, b) => { 
            if(a[0] > b[0]) return 1;
            return -1;
        });

        if (regions.length != 6) return null;
        return regions;
    }

    convertRGBData(mat) {
        let matData = mat.getDataAsArray();
        let fixedData = [];

        matData.forEach((colorRow) => {
            let newRow = [];
            colorRow.forEach((colorCol) => {
                newRow.push(this.rgbToInt(colorCol[2], colorCol[1], colorCol[0])); // BGR
            });
            
            fixedData.push(newRow);
        });

        return fixedData;
    }
};