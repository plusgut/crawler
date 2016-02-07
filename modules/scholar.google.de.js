serious = null;

module.exports = {
	crawler: {
		startContext: 'publisherList',
	},
	scraper: {
		includes: ["bower_components/jquery/dist/jquery.js"],
		response: function(index, protocol, host, err, window) {
			var type = serious.crawler.context[index];
			if(type == 'publisherList') {
				var links = window.jQuery('tr td:nth-child(3) a');
				for(var listIndex = 0; listIndex < links.length; listIndex++) {
					var url = protocol + '//' + host + '/' + links[listIndex].href;
					serious.crawler.addRequest(url, 'bookList');
				}
				serious.crawler.load();
			} else if(type == 'bookList') {
				console.log('BOOKLIST!');
				var books = window.jQuery('tr td.gs_title a span');
				for(var bookIndex = 0; bookIndex < books.length; bookIndex++) {
					console.log(books[bookIndex].innerHTML);
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