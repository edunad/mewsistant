const cv = require('opencv4nodejs');
const trainingData = require('./train_data/data.json');

let slide = Object.keys(trainingData)[0];
Object.keys(trainingData).forEach((slide) => {
    cv.imreadAsync(`./train_data/img/${slide}`, (err, img) => {
        if(err) throw new Error(err);

        let gray = img.cvtColor(cv.COLOR_BGR2GRAY);
        let adaptTresh = gray.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 403, 67);
        let canny = adaptTresh.canny(140, 200, 3);

        let lines = canny.houghLinesP(1, Math.PI / 180, 1, 24, 1 );
        let lineMask = img.cvtColor(cv.COLOR_BGR2GRAY);
        lines.forEach((line) => {
            let p1 = new cv.Point(line.y, line.x);
            let p2 = new cv.Point(line.w, line.z);

            lineMask.drawLine(p1, p2, new cv.Vec3(255, 0, 0), 2);
        });

        adaptTresh = adaptTresh.add(lineMask);

        let ttt = adaptTresh.cvtColor(cv.COLOR_GRAY2BGR);
        let num = 180;
        mask = ttt.inRange(new cv.Vec3(num, num, num), new cv.Vec3(255, 255, 255));

        /*let dilation_size = 0.7;
        let dilateStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2*dilation_size + 1, 2*dilation_size+1), new cv.Point( dilation_size, dilation_size ));
        adaptTresh = adaptTresh.erode(dilateStructure);*/

        cv.imwrite(`./test_results/test_${slide}_canny.jpg`, canny);
        cv.imwrite(`./test_results/test_${slide}.jpg`, mask);

        /*
        let channels = img.splitChannels();
        let maskedChannels = channels.map(c => c.bitwiseAnd(redmask));
        let maskOutput = new cv.Mat(maskedChannels);*/



/*
        let mask = img.inRange(new cv.Vec3(110, 190, 10), new cv.Vec3(255, 255, 255));
        let blurred = mask.gaussianBlur(new cv.Size(3, 3), 0, 0 );
        let thresh = mask.adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 10);
        let canny = thresh.canny(200, 100);

        /*let dilation_size = 0.02;
        let dilateStructure = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2*dilation_size + 1, 2*dilation_size+1), new cv.Point( dilation_size, dilation_size ));
        thresh = thresh.dilate(dilateStructure);

        let angle = 1;
        let lines = canny.houghLinesP(1, angle * (Math.PI / 180), 30, 1, 1 );
        lines.forEach((line) => {
            let p1 = new cv.Point(line.y, line.x);
            let p2 = new cv.Point(line.w, line.z);

            img.drawLine(p1, p2, new cv.Vec3(255, 0, 0), 2);
        });


        cv.imwrite(`./test_results/test_${slide}_canny.jpg`, thresh);
        cv.imwrite(`./test_results/test_${slide}.jpg`, img);*/

/*
        // 40deg
        let angle = 1;
        let lines = canny.houghLinesP(1, angle * (Math.PI / 180), 40, 3, 1 );
        let lineMat = canny.cvtColor(cv.COLOR_GRAY2BGR);

        lines.forEach((line) => {
            let p1 = new cv.Point(line.y, line.x);
            let p2 = new cv.Point(line.w, line.z);

            img.drawLine(p1, p2, new cv.Vec3(255, 0, 0), 2);
        });

        img = img.sub(lineMat);
        //let test = gray.bgrToGray().adaptiveThreshold(255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 15, -2);

        cv.imwrite(`./test_results/test_${slide}_canny.jpg`, canny);
        cv.imwrite(`./test_results/test_${slide}.jpg`, img);*/

        //let thresh = gray.threshold(0, 255, cv.THRESH_OTSU | cv.THRESH_BINARY);
    
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

        //cv.imwrite(`./test_results/test_${slide}.jpg`, canny);

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