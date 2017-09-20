const path = require('path');
const fs = require('fs');

const reporter = require('cucumber-html-reporter');
const arguments = require('minimist')(process.argv.slice(2), {alias: {'i': 'input', 't': 'theme'}});

const outputPath = 'test/results/cucumber_report.html';

/**
 * Process input arguments.
 */
if (!arguments.input) {
  throw new TypeError('Please specify a json file to parse');
}
const inputDataPath = path.resolve(arguments.input);
const inputDataPathModified = inputDataPath.replace('.json', '_modified.json');

const reportTheme = arguments.theme || 'simple';


/**
 * Parse the input json file for fiddling and data.
 */
const inputData = require(inputDataPath);


/**
 * HACK: mark inserted example values for highlighting
 */
 const feature = inputData[0];
 const scenarios = feature.elements;
 scenarios.forEach(scenario => {
   const steps = scenario.steps;
   steps.forEach(step => {
     if (step.match && step.match.arguments) {
       step.match.arguments.forEach(arg => {
         const value = arg.val;
         step.name = step.name.replace(value, "<strong>" + value + "</strong>");
       })
     }
   });
 });
fs.writeFileSync(inputDataPathModified, JSON.stringify(inputData));

/**
 * Set up the parsing options.
 */

var options = {
  theme: reportTheme,
  jsonFile: inputDataPathModified,
  output: outputPath,
  brandTitle: inputData[0].name,
  name: "Specifications",
  reportSuiteAsScenarios: true,
  launchReport: false,
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

/**
 * HACK: Modify the output file
 */
html = fs.readFileSync(outputPath, {'encoding': 'utf8'});
html = html
  .replace('<style type="text/css">', '<style type="text/css">\nstrong {\nfont-size: 1.1em;\n}\n.hide_pre pre {display:none;}\n')
  .replace(/&lt;strong&gt;/g, '<strong>')
  .replace(/&lt;\/strong&gt;/g, '</strong>')
  .replace('<body>', '<body class=hide_pre onclick="this.classList.toggle(\'hide_pre\')">');
fs.writeFileSync(outputPath, html);
