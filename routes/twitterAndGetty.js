var async = require('async'); 
var express = require('express');
var router = express.Router();
var https = require('https'); 
var twitter = require('./helpers/twitter'); 


const options = {
    hostname: "api.gettyimages.com", 
    port: 443, 
    path: '/v3/search/images?fields=comp',
    method: 'GET', 
    headers: {
        'Api-Key': process.env.GETTY_API_KEY
    }
}; 

function makeGettyApiRequest(sendBackResponseToBrowser) {
    var apiResponse = ''; 
    
    https.get(options, function(response){
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            console.log("received data: "); 
            apiResponse += chunk; 
        }); 
        
        response.on('end', function() {
            console.log("status code: " + this.statusCode); 
            //console.log("Complete response: " + apiResponse); 
            /*execute callback*/
            var responseJSON = JSON.parse(apiResponse); 
            var images = responseJSON.images; 
            // console.log(responseJSON); 
            // console.log("num images: " + images.length); 
            // console.log("url of first image: " + images[0].display_sizes[0].uri); 
            var imageURI = images[3].display_sizes[0].uri; 
            
            sendBackResponseToBrowser(null, imageURI); 
            
        }); 
    }).on("error", function(e) {
        console.log("Got an error: " + e.message); 
    }); 
}



router.get('/', function(req, res, next) {
    async.parallel([
        twitter.doAllTwitterRequests,
        makeGettyApiRequest
    ],
    // optional callback
    function(err, results) {
        // results is an array
        // first element is going to be 'tweets'
        // second element is going to be 'imageURI'
        
        var tweets = results[0]; 
        var imageURI = results[1]; 
        
        console.log("num tweets!!!!: " + tweets.length);
        console.log("image URI!!!: " + imageURI); 
        res.render('twitterAndGetty', {tweets: tweets, imageURI: imageURI});
    });
  
});

module.exports = router;

