
function Video(name, description, artistName, rating, url) {
	this.name = name;
	this.description = description;
	this.artistName = artistName;
	this.rating = rating;
	this.url = url;
}

Video.prototype.print = function() {
	console.log(this.name);
	console.log(this.description);
	console.log(this.artistName);
	console.log(this.rating);
	console.log(this.url);
};

function Video(url) {
	this.url = url;
}



function VideoPlayList() {
	this.videos = [];
}

function VideoPlaylist(videos) {
	this.videos=videos;
}

VideoPlaylist.prototype.addVideo = function(video) {

	this.videos.push(video)
}

/** Extract the command line arguments **/
var commandlineArgs = {};
process.argv.forEach(function (val, index, array) {
  //Populate the command line args array
  var vals = val.split("=");
  var key = vals[0];
  var value = vals[1];
  commandlineArgs[key] = value;

});



//Check if right arguments are set in the command line
var allCommandlineKeys = Object.keys(commandlineArgs);
if(allCommandlineKeys.length<7) {
	console.log("ERROR: Improper command line arguments");
	console.log("USAGE: node <filename.js> dropBoxKey=<dropBoxKey> dropBoxSecret=<dropBoxSecret> dropBoxToken=<dropBoxToken> googleApiKey=<googleApiKey> googleUsername=<googleUsername> ")
	process.exit(1);
}

/** Set the Required attributes to use for the program **/
var dropBoxKey = commandlineArgs["dropBoxKey"];
var dropBoxSecret = commandlineArgs["dropBoxSecret"];
var dropBoxToken = commandlineArgs["dropBoxToken"];
var googleApiKey = commandlineArgs["googleApiKey"];
var googleUsername = commandlineArgs["googleUsername"];

var youtubeApiParam = "snippet";
var fileWithVideoUrls = "video_urls.txt";


/** Declarations to be used for Dropbox, Google and Async library **/
var async = require("async");
var google = require('googleapis');
var Dropbox = require("dropbox");



/** Declare the Dropbox Client **/
var client = new Dropbox.Client({
    key: dropBoxKey,
    secret: dropBoxSecret,
    token: dropBoxToken,
    sandbox: false
});

/** Authenticate the Client **/
client.authenticate(function(error, client) {
  if (error) {
    console.log("ERROR: Cannot authenticate Dropbox");
    return showError(error);
  }


console.log("SUCCESS: Dropbox Authenticated !");
});


//Declarations
var express = require('express');
var bodyParser = require('body-parser');

//Getting the app handle
var app = express();


//Getting the json Parser
var jsonParser = bodyParser.json();

app.use(bodyParser.json())


//For cross-domain access
app.use( function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});



/** API Implementation for fetching the details of all videos in the playlist file **/
app.get('/api/v1/playlist', function(req, res) {

 var youtube = google.youtube('v3');
 var videosResponse = null;
 var videoIdList = [];
 var playlist = new VideoPlayList();

 /** 
 *Run Async series that will perform two steps 
 *1. Get the Video URLS from the File hosted on Dropbox Account
 *2. For each Video URL, call Youtube API and get API MetaData
 **/
 async.series({
        one: function(callback) {
		console.log("Calling DropBox API....");
		client.readFile(fileWithVideoUrls, function(error, data) {
                if (error) {
                	return showError(error);  // Something went wrong.
                }

                var videos = data.split("\n");
        	
		videosResponse = videos;
   		callback(null, videos);            	
        })}
            ,
       
	two: function(callback) {
		var videoOuterList = [];
		async.each(videosResponse, function(item, callback) {
			
			/** Find the Video ID from the Video URL -- Currently works for YOUTUBE Only**/
			var videoId = null;


			//Find the Video ID in the URL 
			if(item.indexOf("&")!=-1) //If there are other Query Parameters in the youtube URL
			{
				videoId = item.substring(item.indexOf("=")+1, item.indexOf("&"));
			}
			else //If the youtube URL only contains the Video ID
			{
				videoId = item.substring(item.indexOf("=")+1);
			}

			//Call the Youtube API
			youtube.videos.list(
					{
						key: googleApiKey, 
						userId:googleUsername ,
						id:videoId, 
						part:youtubeApiParam
					},
					function(req, res) { 
							
							//Process the Response received from the API
							var snippet = res.items[0].snippet; 
							console.log("title: " + snippet.title);
							console.log("description : " + snippet.description);
							console.log("channelTitle : " + snippet.channelTitle);
							
							var v = new Video();
							v.name = snippet.title;
							v.description = snippet.description;
							v.channelTitle = snippet.channelTitle;
							v.rating = 1;
							v.url=item; 
							playlist.videos.push(v);
							console.log(JSON.stringify(v));
							callback();
						});
		


			
		
		}, function(err) {console.log("Metadata of all Videos is obtained...");
			
			callback(null, playlist); //Add the playlist metadata to the response array
			 });

		
	}
    },
    function(err, response) {
       
	console.log("Sending the JSON Response for the metadata of all Videos..."); 
	res.send(response["two"]); //Send the second item in the response array back as API Response
   }
);

});

console.log('starting server for the Playlist API.... at 8080 port');
app.listen(process.env.PORT || 8080);
