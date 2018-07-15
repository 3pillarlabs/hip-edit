import Jasmine from 'jasmine';

const jasmine = new Jasmine();
jasmine.loadConfigFile('spec/support/jasmine-integration.json');
jasmine.execute();
