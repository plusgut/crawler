#! /usr/bin/env node

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
			// console.log(this.header);
		}
	},
	scraper: {

	},
	module: {
		load: function(host) {

		}
	},
	process: {
		parse: function(args) {
			var url = null;
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
					if(url) throw 'There was already an url set ' + url;
					url = para;
				}
			}

			if(key) {
				throw 'There was no value set for ' + key;
			}
			return {url: url, opt: opt};
		}
	}
};

var url = serious.process.parse(process.argv);

if(url) {
	serious.crawler.init(url);
}

module.exports = serious;