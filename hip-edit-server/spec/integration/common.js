import Jasmine from 'jasmine';
import JasmineConsoleReporter from 'jasmine-console-reporter';

/**
 * Creates a new Jasmine test runner with appropriate configuration.
 * @return {Jasmine} test runner
 */
export function newJasmineInstance() {
  const jasmine = new Jasmine();
  jasmine.loadConfigFile('spec/support/jasmine-integration.json');
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
}
