const cv = require('opencv4nodejs');
const trainingData = require('./train_data/data.json');

let slide = Object.keys(trainingData)[0];
Object.keys(trainingData).forEach((slide) => {
    cv.imreadAsync(`./train_data/img/${slide}`, (err, img) => {
        if(err) throw new Error(err);

        let gray = img.cvtColor(cv.COLOR_BGR2GRAY);
        let thresh = gray.threshold(0, 255, cv.THRESH_OTSU | cv.THRESH_BINARY);
    
        //let kernel = np.ones((5,4), np.uint8)
        /*let grayImg = img.bgrToGray();
        let bw = grayImg.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, -2);*/

        //bw = bw.erode(bw, new cv.Point(1, 1));

        //bw = horizontalStructure.dilate(bw, bw, horizontalStructure, new cv.Point(-1, -1));


        // extract lines
        //let horizontal = new cv.Mat(bw);
        /*let horizontalsize = bw.cols / 10;
        let horizontalStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(horizontalsize, 1));
        horizontalStructure.erode(bw, bw, horizontalStructure, new cv.Point(-1, -1));
        horizontalStructure.dilate(bw, bw, horizontalStructure, new cv.Point(-1, -1));

        
        bitwise_not(vertical, vertical);*/

        cv.imwrite(`./test_${slide}.jpg`, thresh);

        /*let grayImg = img.bgrToGray();
        let cake = grayImg.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 85, 90);
        let edges = img.canny(100, 200);

        //let rangeMask = img.inRange(new cv.Vec3(131, 131, 131), new cv.Vec3(69, 69, 69));
        //let thresholded = rangeMask.threshold(69, 131, cv.THRESH_BINARY);
        cv.imwrite(`./test_${slide}.jpg`, edges);*/

        /*330, 100%, 83%
        329, 67%, 45%*/

        /*
        let mask = img.inRange(new cv.Vec3(191, 17, 113), new cv.Vec3(255, 255, 255));
        let channels = img.splitChannels();
        let maskedChannels = channels.map(c => c.bitwiseOr(mask));
        let maskOutput = new cv.Mat(maskedChannels);

        let treshHold = maskOutput.bgrToGray().threshold(150, 255, cv.THRESH_BINARY_INV);*/

        //let blur = treshHold.blur(new cv.Size(3, 3));
        //let blurTresh = blur.threshold(20, 255, cv.THRESH_BINARY);

        /*let countours = treshHold.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        console.debug(countours);
        let countMat = treshHold.drawContours(countours, new cv.Vec3(255, 0, 0));*/

        //cv.imwrite(`./test_${slide}.jpg`, treshHold);
    /*
        let blurred = maskOutput.blur(new cv.Size(2, 2));

        blurred.thresholdAsync(240, 255, cv.THRESH_BINARY).then((treshMat) => {
            let blckWhite = treshMat.bgrToGray();
            let countours = blckWhite.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_TC89_L1);
            let countMat = treshMat.drawContours(countours, new cv.Vec3(255, 0, 0));

            console.debug(countours);
            cv.imwrite('./test.jpg', countMat);
        });*/
    });
});