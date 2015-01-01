The NodeJs program implements a simple API that will pull a custom Video Playlist file from Dropbox account and then, extract 
metadata for each video in the playlist file. This metadata is then put together as a JSON Response and send over to the client. 

Overall the flow is as following :-

1. Upload a file in your dropbox with the name "video_urls.txt" that will contain the video URLs (currently only YOUTUBE videos) in a newline delimiter form 
Sample File for reference :- https://gist.github.com/vivekjuneja/42b3444a12ca604131fd

2. Get your Dropbox API Key, Secret and Token through the Developer Portal page of Dropbox. Its fairly easy to get it :-
  
   a. Goto https://www.dropbox.com/developers/apps
   
   b. Register a Dropbox App. 
   
   c. Give a Unique name to the app, and click on Create
   
   d. Pick up the relevant key, secret and token for the Dropbox project

3. For this API, I have assumed the source is ONLY Youtube for now. So, to grab the details of each video, you need access credentials for making API requests to Youtube. This can be obtained from the link :- https://developers.google.com/youtube/v3/
Follow the steps :-

 a. Create a Project using "https://console.developers.google.com/project"

 b. After creating a project, Access the APIs menu

 c. Find "YouTube Data API v3" on the page, and click on it. 

 d. Turn on the Youtube API

 e. Grab the credentials for the new project. We need the API Key that will be crucial to run our API
 

4. That's all. The credentials from step 2 and 3 are needed to configure the API Implementation. Please KEEP THIS INFORMATION handy, as you would need it configure the API Implementation. 

5. Install NodeJS on your system 

6. Install the NodeJS libraries :-

    npm install express
    
    npm install body-parser
    
    npm install async
    
    npm install dropbox
    
    npm install googleapis


*Running API :-*

7. Run the playlist_api.js using the command line arguments :-

   node playlist_api.js dropBoxKey=XXXXX dropBoxSecret=XXXXX dropBoxToken=XXXXX googleApiKey=XXXXX googleUsername=XXXXX

8. Once the server starts, access the API using a Browser or a REST Client using the URI :-
   
   http://HOSTNAME:8080/api/v1/playlist

   Test using Curl :-
   curl -i -H "Accept: application/json" http://HOSTNAME:8080/api/v1/playlist
   

9. Error Response has NOT been added yet. Need to add that in the next revision
