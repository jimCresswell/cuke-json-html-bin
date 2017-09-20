const path = require('path');

const reporter = require('cucumber-html-reporter');
const arguments = require('minimist')(process.argv.slice(2), {alias: {'i': 'input'}});


/**
 * Process input arguments.
 */
if (!arguments.input) {
  throw new TypeError('Please specify a json file to parse');
}
const inputDataPath = path.resolve(arguments.input);


/**
 * Set up the parsing options.
 */
const inputData = require(inputDataPath);

var options = {
  theme: 'simple',
  jsonFile: inputDataPath,
  output: 'test/results/cucumber_report.html',
  brandTitle: inputData[0].name,
  name: "Specifications",
  reportSuiteAsScenarios: false,
  launchReport: true,
  metadata: {
    "App Version":"0.3.2",
    "Test Environment": "STAGING",
    "Browser": "Chrome  54.0.2840.98",
    "Platform": "Windows 10",
    "Parallel": "Scenarios",
    "Executed": "Remote"
  }
};

reporter.generate(options);
