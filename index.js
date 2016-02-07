#! /usr/bin/env node
var request   = require('request');
var fs        = require('fs');
var mkdirp    = require('mkdirp');
var jsdom     = require('jsdom');
var urlParser = require('url');
var lodash    = require('lodash');

var serious =  {
	////-----------------------------------------------------------------------------------------
	// crawls the link and searches for others, and saves those to the cache
	crawler: {
		////-----------------------------------------------------------------------------------------
		// the index of the queue
		current: 0,
		////-----------------------------------------------------------------------------------------
		// list of url-strings
		queue:   [],
		////-----------------------------------------------------------------------------------------
		// says what type of url it is, but this is optional for some cases
		context: [],
		////-----------------------------------------------------------------------------------------
		// whats the first index to use
		startContext: 'index',
		////-----------------------------------------------------------------------------------------
		// Sets up the initial request and overwrites functions from the module depending of host
		init: function(opt) {
			this.host = opt.url.host;
			serious.module.load(opt.url.host);
			this.addRequest(opt.url.href, this.startContext);
			this.load();
		},
		load: function() {
			while(this.current < this.queue.length) {
				this.request();
			}
		},
		////-----------------------------------------------------------------------------------------
		// Handles requests, or takes the cached version
		request: function() {
			var self    = this;
			var current = self.current;
			var url     = urlParser.parse(this.queue[current]);
			var cb      = serious.scraper.response.bind(serious.scraper, current, url.protocol, url.host);
			var cache = serious.cache.get(url);
			if(cache === false) {
				request(url.href, function (error, response, body) {
					console.log('Loading: ' + url.href);
					if (!error && response.statusCode == 200) {
						// added index to scraper call
						serious.cache.set(url, body);
						jsdom.env(body, serious.scraper.includes, cb);
					} else {
						if(!response) response = {};
						console.error(url.href + ' Failed', error, response.statusCode);
					}
				});
			} else {
				jsdom.env(cache, serious.scraper.includes, cb);
			}
			self.current++;
		},
		////-----------------------------------------------------------------------------------------
		// Checks if a url is already processed
		addRequest: function(url, context) {
			if(!this.isLoaded(url)) {
				// @TODO add host check
				this.queue.push(url);
				this.context.push(context);
			} else {
				console.warn('The url was already in the system ' + url);
			}
		},
		////-----------------------------------------------------------------------------------------
		// Checks if url already got processed, does not check filesystem cache
		isLoaded: function(url) {
			if( this.queue.indexOf(url) === -1 ) {
				return false;
			} else {
				return true;
			}
		},
	},
	////-----------------------------------------------------------------------------------------
	// parses data from the body
	scraper: {
		////-----------------------------------------------------------------------------------------
		// external libraries like jquery can be added here
		includes: [],
		////-----------------------------------------------------------------------------------------
		// the place where your scraper module should put data in
		data: {},
		////-----------------------------------------------------------------------------------------
		// main function for scraping the relevant informations
		response: function(index, protocol, host, err, window) {
			console.log(index, window.document.links.length, window.document.getElementsByTagName('li').length);

		},
		////-----------------------------------------------------------------------------------------
		// When everything is crawled, this function gets triggered
		done: function() {
			console.log(this.data);
		}
	},
	module: {
		////-----------------------------------------------------------------------------------------
		// overwrites this function by your module
		init: function(parent) {
			throw 'Overwrite this function to get the scope of the parent';
		},
		////-----------------------------------------------------------------------------------------
		// overwrites the module, depending on the host
		load: function(host) {
			try {
				var mod = require('./modules/' + host);
				lodash.merge(serious, mod);
				serious.module.init(serious);
			} catch(err) {
				console.warn('Could not load a module for ' + host, err);
			}
		}
	},
	////-----------------------------------------------------------------------------------------
	// handles the caching of the requests
	cache: {
		////-----------------------------------------------------------------------------------------
		// delimiter
		delimiter: '/',
		////-----------------------------------------------------------------------------------------
		// where should the cached be saved in
		prefix: 'cache/crawler',
		////-----------------------------------------------------------------------------------------
		// checks if a request got cached, then it returns the body, else it returns false
		get: function(url) {
			try {
				var path = this.prefix + this.delimiter + url.host + this.delimiter + url.path;
				var file = fs.readFileSync(path, 'utf8');
				return file;
			} catch(err){
				return false;
			}
		},
		////-----------------------------------------------------------------------------------------
		// saves a body to the cache
		set: function(url, body) {
			var delimiter = this.delimiter;
			var pathParts = url.path.split(delimiter);
			var fileName  = pathParts.pop();
			var path = this.prefix + delimiter + url.host + delimiter + pathParts.join(delimiter);
			mkdirp(path, function(err) {
				fs.writeFile(path + delimiter + fileName, body, function(err) {
					if (err) {
						console.error(err);
					}
				});
			});
		}
	},
	////-----------------------------------------------------------------------------------------
	// helper function for cli interface
	process: {
		////-----------------------------------------------------------------------------------------
		// parses the command line interface
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
					result = urlParser.parse(para);
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

// currently is not useful, but maybe later on
module.exports = serious;