
const colors = require('colors');

const Mew = require('./src/models/meowtcha');
const trainingData = require('./train_data/data.json');

// Clear screen
process.stdout.write("\u001b[2J\u001b[0;0H");

let solver = new Mew(trainingData);
solver.init(() => {
    solver.solveMeowtcha('./train_data/img/200.jpg', (result) => {
        console.debug('\n\nMeowster'.magenta + ", i think it's ".white + result.toString().inverse + " (=^-ω-^=)\n\n");
    });
});
