var express = require('express');
var fs = require('fs');
var app = express();
var path = require('path');
var bodyParser = require('body-parser')
var https = require('https');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: true
}));

var apiKey = '108d538b05d8876a2cb3aa2e6f865446';

var urls = [];

var responseString = '';

// get homepage
app.get('/', function(req, res) {
	fs.readFile(path.join(__dirname + '/index.html'), {encoding: 'utf8'}, function (error, buffer) {
		if (error) {
			// something errorrrr
		}
		res.send(buffer.replace('<span>', responseString));
		getPhotos();
		responseString = '';
	});
});

function getPhotos()
{
	var random = Math.floor(Math.random() * 10);

	var photosRequest = 'https://api.flickr.com/services/rest/?';
	photosRequest += '&method=flickr.interestingness.getList';
	photosRequest += '&api_key=' + apiKey;
	photosRequest += '&format=json';
	photosRequest += '&nojsoncallback=1';
	photosRequest += '&page=' + random;
	// photosRequest += '&page=17';
	photosRequest += '&per_page=10';

	var requestPhotos = https.get(photosRequest, function(response) {
		var buffer = '';
		var photos;

		response.on('data', function(chunk) {
			buffer+= chunk;
		});

		response.on('end', function(err) {
			photos = (JSON.parse(buffer)).photos;
			for (var i = 0; i < photos.perpage; i++)
			{
				getSizes(photos.photo[i].id);
			};
		});
	});
};

function getSizes(photo)
{
	var sizeRequest = 'https://api.flickr.com/services/rest/?';
	sizeRequest += '&method=flickr.photos.getSizes';
	sizeRequest += '&api_key=' + apiKey;
	sizeRequest += '&photo_id=' + photo;
	sizeRequest += '&format=json';
	sizeRequest += '&nojsoncallback=1';

	var requestSizes = https.get(sizeRequest, function(response) {
		var buffer = '';
		var sizes;

		response.on('data', function(chunk) {
			buffer+= chunk;
		});

		response.on('end', function(err) {
			sizes = (JSON.parse(buffer)).sizes;
			responseString += '<img src="' + sizes.size[5].source + '">';
		});
	});
}

// start server
app.listen(8000);
getPhotos();
console.log('server running at localhost:8000');
