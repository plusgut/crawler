#! /usr/bin/env node
var request = require('request');
var jsdom   = require('jsdom');
var url     = require('url');

var serious =  {
	crawler: {
		current: 0,
		queue:   [],
		context: [],
		init: function(opt) {
			console.log(opt);
			var host = '';
			serious.module.load(host);
			this.addRequest(opt.url.href, 'index');
			this.request(opt);
		},
		request: function(opt) {
			var self = this;
			var current = self.current;
			request(opt.url.href, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					// added index to scraper call
					var cb = serious.scraper.response.bind(serious.scraper, current);
					jsdom.env(body, serious.scraper.includes, cb);
				} else {
					console.error(opt.url.href + ' Failed');
				}
			});
			self.current++;
		},
		addRequest: function(url, context) {
			if(this.queue.indexOf(url) === -1) {
				this.queue.push(url);
				this.context.push(context);
			} else {
				console.log('The url was already in the system ' + url);
			}
		}
	},
	scraper: {
		includes: [],
		response: function(index, err, window) {
			console.log(index, window.document.links);
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