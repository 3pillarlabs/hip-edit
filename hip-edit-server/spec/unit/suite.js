const newJasmineInstance = require('./common').newJasmineInstance;

const jasmine = newJasmineInstance('spec/support/jasmine.json');
jasmine.execute();
