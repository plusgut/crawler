#! /usr/bin/env node
var request = require('request');
var jsdom   = require('jsdom');
var url     = require('url');

var serious =  {
	crawler: {
		queue: [],
		init: function(opt) {
			console.log(opt);
			var host = '';
			serious.module.load(host);
			this.request(opt);
		},
		request: function(opt) {
			request(opt.url.href, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					jsdom.env(body, serious.scraper.includes, serious.scraper.response);
				} else {
					console.error(opt.url.href + ' Failed');
				}
			});
		}
	},
	scraper: {
		includes: [],
		response: function(err, window) {
			console.log(window.document.links);
		}
	},
	module: {
		load: function(host) {

		}
	},
	process: {
		parse: function(args) {
			var result = null;
			var key = null;
			var opt = {};
			for(var i = 2; i < process.argv.length; i++) {
				var para = process.argv[i];
				if(para.indexOf('--') === 0) {
					if(key) throw key + ' had no corresponding value';
					key = para.slice(2, para.length);
				} else if(key) {
					opt[key] = para; // @TODO implement --header.cookie
					key = null;
				} else {
					if(result) throw 'There was already an url set ' + url;
					result = url.parse(para);
				}
			}

			if(key) {
				throw 'There was no value set for ' + key;
			}
			return {url: result, opt: opt};
		}
	}
};

var url = serious.process.parse(process.argv);

if(url) {
	serious.crawler.init(url);
}

module.exports = serious;