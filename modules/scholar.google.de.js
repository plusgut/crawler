var urlParser = require('url');

serious = null;

module.exports = {
	crawler: {
		startContext: 'publisherList',
		headers: {
			'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'accept-language': 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4',
			'cache-control': 'max-age=0',
			'cookie': 'CONSENT=WP.24c057.24c120; SID=DQAAAEoBAACB3cRrcRCGLczE75XhQ0dPHk-ViyHWmiz22Y30QrfBp0Uk9BtRvR6dvhPIpuRNg-X-2gLP1i0mKRvu6ARxA-WKOIbFWjKOwGZAKVjwLjHJVVMdzF_0qlSXfBe7SjEHQxHBoHbdUqJI1OSZlOmxOvN94FNUcyHvwou062C1ejS9QFRZvXqesaWOVvCPYH5cEXlyTOhyaPM8x8d-pgUJ24wR1uCDiJePNzous3wPLj1zX1recMYf2jh63n1qIFFRF-6qYL1uKASJQ7k7zIUipLLOMp--wn2vTfxeXJbCRErZosSOTgzPrD3FGK-qO_maY8jqo8aNgA3DJ7gH9ZYGYqhbkKXgJJWqy8zENwiSXBJXnv7SwJ5D1PGdlnebmuSJdwgZNhS3v_vk-kgrdZQQ6-mREU4IFVg7sqRhBmgbvNnR2XNPjsDwK4AxfT80OqYqJcI; HSID=AoaFAg973s73i1iHI; SSID=AeMlK-JUtNLFN2R7K; APISID=qN3KdlNTLg7UJRpc/AIMFJungfV-Cl0aIr; SAPISID=lk7PhKYGEPwa8lJM/AYpTObcobeY7ju5IA; OGPC=5061899-1:; GSP=LM=1454779715:S=kjHAikKiVSv0mR3C; NID=76=N9evdwyNVNE0gAyAVUMSew5hpyP21FTOSt7M4DJlNPLTJqG0KwGzp2zYKPtiAHuY_VTDawbbk6x5nhEc3XLBhOJjCoiKT-8n6xHpRcShjPQRBLFXwqnSixduVV9ITbXzSHIOu4O9IlTJOGOWMW3BV_w-PgWuJBwxYzs8Io9W4z51QukjJDuGLeIILvhnLNXwVVwjT-jO3C2sJ3cH8wkVyx26VKS8RZyfBdvUztYixwv4pdA2m2_W1H1G8WWF_-aTwF7Lwx6-Kv-SgpC7fjqEFA05-lreDCHEVRm1mb6qC1PpFEeL-02_nxhD43tBwIz6zNOTIpfWx1DDXU_gnNmYy7twuhVvDoiZbhhdXer3wEnizorYgsZAIQovKNCwdw',
			'upgrade-insecure-requests': '1',
			'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
			'x-chrome-uma-enabled': '1',
			'x-client-data': 'CKW2yQEIgIrKAQixlcoBCP2VygE=',
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

					this.save({
						host: url.host,
						path: query.cluster + '.json'
					}, entity);
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