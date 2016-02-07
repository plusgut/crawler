#! /usr/bin/env node

var fs = require('fs');

var path = __dirname + '/' + process.argv[2];

var items = [];
fs.readdir(path, function(err, directories) {

	for(var i = 0; i < directories.length; i++) {
		var file = fs.readFileSync(path + '/' + directories[i], 'utf8');
		items.push(JSON.parse(file));
	}
	console.log(JSON.stringify(items));
});