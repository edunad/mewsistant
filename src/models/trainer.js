const cv = require('opencv4nodejs');
const tf = require('@tensorflow/tfjs-node');

module.exports = class Trainer {
    constructor(trainingData) {
        this.trainingData = trainingData;
        this.letterData = {};
    }

    buildTrainModel() {
        // Based of https://github.com/zxdong262/tf-captcha-reader/blob/master/main.py
        // https://html5beta.com/page/tutorial-reading-captcha-with-tensorflow.html

        // Keras or whatever this is
        this.AImodel = tf.sequential();

        this.AImodel.add(tf.layers.flatten({inputShape: [180, 45]})); // It will be a 180x45px captcha
        this.AImodel.add(tf.layers.dense({units: 128, activation: "relu"})); // 128 layers
        this.AImodel.add(tf.layers.dense({units: Object.keys(this.letterData).length, activation: "softmax"})); // Not entirely sure

        this.AImodel.compile({optimizer: 'adam', loss: 'meanSquaredError', metrics: 'accuracy'});

        Object.keys(this.letterData).forEach((label) => {
            console.debug(this.letterData[label], label);
            throw new Error('s');
            this.AImodel.fit(this.letterData[label], label);
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
        
                let gray = img.cvtColor(cv.COLOR_BGR2GRAY);
                let smooth = gray.gaussianBlur(new cv.Size(3, 3), 0, 0 );
        
                let dilation_size = 4;
                let dilateStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2*dilation_size + 1, 2*dilation_size+1), new cv.Point( dilation_size, dilation_size ));
                smooth = smooth.erode(dilateStructure);
        
                let adaptTresh = smooth.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 185, 13);
                
                let borderSize = 5;
                adaptTresh.drawRectangle(new cv.Point2(borderSize / 2, borderSize / 2), new cv.Point2(img.sizes[1] - borderSize / 2, img.sizes[0] - borderSize / 2), 
                                     new cv.Vec3(255, 255, 255), borderSize);
        
                
                let readTresh = adaptTresh.add(gray);
                let inv = adaptTresh.sub(gray);
        
                dilation_size = 0.3;
                dilateStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2*dilation_size + 1, 2*dilation_size+1), new cv.Point( dilation_size, dilation_size ));
                inv = inv.erode(dilateStructure);
        
                let finalTresh = inv.threshold(1, 10, cv.THRESH_BINARY_INV);
                let contours = finalTresh.findContours(cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
                let regions = [];
                let debugHulls = [];
                
                contours.forEach((countour, indxx) => {
                    let hull = countour.convexHull(false);
                    if (hull.area <= 100) return;
                    let box = hull.boundingRect();

                    debugHulls.push(hull);

                    if (box.height > 100) {
                        regions.push([box.x, box.y, box.width / 2, box.height]);
                        regions.push([box.x + box.width / 2, box.y, box.width / 2, box.height]);
                        return;
                    }

                    regions.push([box.x, box.y, box.width, box.height]);
                });

                // sort hulls using X
                regions.sort((a, b) => { 
                    if(a[0] > b[0]) return 1;
                    return -1;
                });

                if (regions.length != 6) {
                    cv.imwrite(`./fault_training/thresh_${slide}`, readTresh);
                    cv.imwrite(`./fault_training/final_${slide}`, finalTresh);
                    console.log('[Warning] '.red + `Invalid training image "${slide}". Expected 6 letters, found ${regions.length}!`);
                    return onDone();
                }

                for(let i = 0; i < regions.length; i++) {
                    let letter = this.trainingData[slide][i];
                    let region = regions[i];

                    let mat = img.getRegion(new cv.Rect(region[0], region[1], region[2], region[3]));
                    mat = mat.resize(new cv.Size(28, 28)); // Scale all to 28x28

                    let matData = mat.getDataAsArray();
                    let fixedData = [];

                    matData.forEach((colorRow) => {
                        let newRow = [];
                        colorRow.forEach((colorCol) => {
                            newRow.push(this.rgbToInt(colorCol[2], colorCol[1], colorCol[0])); // BGR
                        });
                        
                        fixedData.push(newRow);
                    });

                    if(this.letterData[letter] == null) this.letterData[letter] = [fixedData];
                    else this.letterData[letter].push(fixedData);

                    // On Debug
                    cv.imwrite(`./letters/${letter}_${this.letterData[letter].length}.jpg`, mat);
                }

                return onDone();
            });
        });
    }
};