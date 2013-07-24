#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var CHECKSFILE_DEFAULT = "checks.json";
var HTMLFILE_TMP = "tmp.html";
var rest = require('restler');
var util = require('util');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var JSONchecks = function(htmlfile) {
    var checkJson = checkHtmlFile(htmlfile, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}


var checkURL = function(result) {
    //console.log("in checkURL");
    if (result instanceof Error) {
	console.error("Error: " + util.format(result.message));
	process.exit(1);
    } else {
	//console.log("response is: " + result.toString());
	//console.log("saving URL data to " + HTMLFILE_TMP);
	fs.writeFileSync(HTMLFILE_TMP, result.toString());
	JSONchecks(HTMLFILE_TMP);
    }
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html')
        .option('-u, --url <URL>', 'Link to html_file')
        .parse(process.argv);
    var htmlfile = HTMLFILE_TMP;
    if (!program.file && !program.url) {
	console.log("must provide HTML file path or URL");
	process.exit(1);
    }
    if (program.file && program.url) {
	console.log("must provide either HTML file path or URL, not both");
	process.exit(1);
    }
    if (program.url) {
	//console.log("URL is " + program.url);
	rest.get(program.url).on('complete', checkURL);
    }
    else {
	//console.log("file option, file is " + program.file);
	assertFileExists(program.file);
	JSONchecks(program.file);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
