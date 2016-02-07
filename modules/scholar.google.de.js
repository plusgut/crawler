var urlParser = require('url');

serious = null;

module.exports = {
	crawler: {
		startContext: 'publisherList',
	},
	scraper: {
		includes: ["bower_components/jquery/dist/jquery.js"],
		response: function(index, url, err, window) {
			var type = serious.crawler.context[index];
			if(type == 'publisherList') {
				var links = window.jQuery('tr td:nth-child(3) a');
				for(var listIndex = 0; listIndex < links.length; listIndex++) {
					var path = url.protocol + '//' + url.host + '/' + links[listIndex].href;
					serious.crawler.addRequest(path, 'bookList');
				}
				serious.crawler.load();
			} else if(type == 'bookList') {
				var books = window.jQuery('tr:not(:first)');
				for(var bookIndex = 0; bookIndex < books.length; bookIndex++) {
					var book      = window.jQuery(books[bookIndex]);
					var bookLink  = book.find('td.gs_title a').attr('href');
					var query     = urlParser.parse(bookLink, true).query;

					var entity = {
						title:     book.find('td.gs_title a span').html(),
						authors:   book.find('td.gs_title .gs_authors').html().split(', '),
						publisher: book.find('td.gs_title .gs_pub').html()
					};

					this.save(query.cluster + '.json', entity);
					console.log(entity);
				}
			}
		}
	},
	module: {
		init: function(parent) {
			serious = parent;
		}
	},
};