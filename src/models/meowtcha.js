
const fs = require('fs-extra');
const Trainer = require('./trainer');

module.exports = class Meowtcha {

    constructor(trainData) {
        this.trainer = new Trainer(trainData, 28); // 28 by 28 pixels
    }

    init(done) {
        this.prepareFolders(() => {
            this.trainer.initialize(() => {
                this.checkBrain((exists) => {
                    if(!exists) return this.startTraining(done);
                    this.trainer.loadModel((err) => {
                        if(err) throw new Error(err);
                        return done();
                    });
                });
            });
        });
    }

    prepareFolders(done) {
        fs.ensureDir('./brains').then(() => {
            return done();
        });
    }

    checkBrain(callback) {
        fs.stat('./brains/meow_brain', (err, stat) => {
            if(err) return callback(false);
            fs.stat('./brains/meow_tail.json', (err2, stat) => {
                return callback(err2 == null)
            });
        });
    }

    solveMeowtcha(image, onDone) {
        if(this.trainer.AImodel == null) throw new Error('Run .init() first!');
        this.trainer.predict(image, (result) => {
            return onDone(result);
        })
    }

    startTraining(onTrained) {
        this.trainer.prepareData(() => {
            this.trainer.buildTrainModel(() => {
                this.trainer.saveModel((err) => {
                    if(err) throw new Error(err);
                    return onTrained();
                });
            });
        });
    }
}
