var urlParser = require('url');

serious = null;

module.exports = {
	crawler: {
		startContext: 'publisherList',
		headers: {
		},
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
				var categories = window.jQuery('#gs_m_broad a');
				for(var categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
					var category = categories[categoryIndex];
					serious.crawler.addRequest(url.protocol + '//' + url.host + '/' + category.href, 'publisherList');
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
						publisher: book.find('td.gs_title .gs_pub').html(),
						quoted:    book.find('td.gs_num a').html(),
						id:        query.cluster
					};

					this.save({
						host: url.host,
						path: query.cluster + '.json'
					}, JSON.stringify(entity));
					console.log(entity);
				}
				var windowLocation = 'window.location=';
				var nextButton = window.jQuery('.gsc_pgn button:last').attr('onclick');
				var nextPath = nextButton.slice(windowLocation.length, nextButton.length - 1);
				serious.crawler.addRequest(nextPath, 'bookList');
				serious.crawler.load();
			}
		}
	},
	module: {
		init: function(parent) {
			serious = parent;
		}
	},
};