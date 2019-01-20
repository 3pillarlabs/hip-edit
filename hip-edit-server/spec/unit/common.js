const Jasmine = require('jasmine');
const JasmineConsoleReporter = require('jasmine-console-reporter');

module.exports.newJasmineInstance = function(configPath) {
  const jasmine = new Jasmine();
  jasmine.loadConfigFile(configPath);
  const reporter = new JasmineConsoleReporter({
    colors: 1,
    cleanStack: 1,
    verbosity: 4,
    listStyle: 'indent',
    timeUnit: 'ms',
    timeThreshold: {ok: 500, warn: 1000, ouch: 3000},
    activity: true,
    emoji: true,
    beep: true,
  });
  jasmine.env.clearReporters();
  jasmine.addReporter(reporter);

  return jasmine;
};
