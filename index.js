const path = require('path');
const fs = require('fs');

const reporter = require('cucumber-html-reporter');
const arguments = require('minimist')(process.argv.slice(2), {alias: {'i': 'input', 't': 'theme'}});

const outputDir = 'test/results/';
const outputPathHtml = outputDir + 'cucumber_report.html';
const outputPathCss = outputDir + 'main.css';

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

const options = {
  theme: reportTheme,
  jsonFile: inputDataPathModified,
  output: outputPathHtml,
  brandTitle: inputData[0].name,
  name: "Specifications",
  reportSuiteAsScenarios: true,
  launchReport: false
};

reporter.generate(options);

/**
 * HACK: Modify the output file
 */

// Get the unmodified HTML
var html = fs.readFileSync(outputPathHtml, {'encoding': 'utf8'});

// Modify HTML contents
html = html
  .replace('<style type="text/css">', '<style type="text/css">\nstrong {\nfont-size: 1.1em;\n}\n.hide_pre pre {display:none;}\n')
  .replace(/&lt;strong&gt;/g, '<strong>')
  .replace(/&lt;\/strong&gt;/g, '</strong>')
  .replace('<body>', '<body class=hide_pre onclick="this.classList.toggle(\'hide_pre\')">')
  .replace('</head>', '<link rel="stylesheet" type="text/css" href="main.css" />\n</head>');

// Cache and remove css
cssRegex = /<style[\s\S]+<\/style>/;
const css = html.match(cssRegex);
html = html.replace(css, '');

// Write out CSS-less HTML
fs.writeFileSync(outputPathHtml, html);

// Write out CSS
fs.writeFileSync(outputPathCss, css);
