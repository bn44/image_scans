// Require
var app = require('express')();
var watchr = require('watchr');
var fs = require('fs'),
    http = require('http'),
    sio = require('socket.io');
    
    
    

//var server = http.createServer(function(req, res) {
//  res.writeHead(200, { 'Content-type': 'text/html'});
//  res.end(fs.readFileSync('./index.html'));
//});

var server = http.createServer(app);


server.listen(3698, function() {
  console.log('Server listening at http://localhost:3698');
});

// Attach the socket.io server
io = sio.listen(server);

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

app.get('/', function(req, res){
  res.sendfile(__dirname + '/' +filePath);
});


//to keep track of the masseges on the chat
var messages = [];
//to transport the images information!
var notes = [];
var points = [];
var pointsJson=JSON.stringify(points);
    // Define a message handler
    io.sockets.on('connection', function (socket) {
	
	socket.on('message', function (msg) {
	    console.log('Received: ', msg);
	    messages.push(msg);
	    socket.broadcast.emit('message', msg);
	});
    
        // send messages to new clients
	messages.forEach(function(msg) {
	    socket.send(msg);
	});
	
	notes.forEach(function(notes) {
	    socket.send(notes);
	});
	
	points.forEach(function(points) {
	    socket.send(points);
	});
	
    });  
				
    function Report(notes) {
	io.sockets.emit('notes', notes);
    };
    
    function features(points) {
      io.sockets.emit('map',points); 
    };
    
// Watch a directory or file
console.log('Watch our paths');
watchr.watch({
    paths: ['./images'],
    
    //intervals: 2000, 
    preferredMethods: ['watchFile','watch'],
    listeners: {
        //log: function(logLevel){
        //    console.log('a log message occured:', arguments);
        //},
        error: function(err){
            console.log('an error occured:', err);
        },
        watching: function(err,watcherInstance,isWatching){
            if (err) {
                console.log("watching the path " + watcherInstance.path + " failed with error", err);
            } else {
                console.log("watching the path " + watcherInstance.path + " completed");
            }
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
	    
	    
	    
	    console.log("___________Any File Change Info.______________");
	    console.log('Notes--------------->: ' + notes[notes.length-1]);
	    console.log('Change Type--------->: ' + changeType);
	    console.log('file Current State--->: ' + fileCurrentStat);
	    console.log('file Previous State-->: ' + filePreviousStat);
	    
	    console.log("------------------------------------------");
	   
	// extract the exif data from the image that is newly created			
	    if (changeType === 'create') {
		//code
		var ExifImage = require('exif').ExifImage;
		 try {
		     new ExifImage({ image : filePath }, function (error, image) {
			 if (error){
			     console.log('Error: '+error.message);
			} else{
			   
			     console.log(image);
			     console.log("_______________________________");
			    
			     console.log(image.gps[3].tagName); // Do something with your data!
			     console.log(image.gps[3].value[0]);
			    
			     console.log(image.gps[1].tagName); // Do something with your data!
			     console.log(image.gps[1].value[0]);
			     
			    

			    
			     console.log("-------------------------------");
                             points.push({geometry: {type: "Point", coordinates: [-1*image.gps[3].value[0],image.gps[1].value[0]]},
					properties: {
					  url: filePath, // filePhath
					  Make: image.image[0].value,
					  Model: image.image[1].value,
					  When: image.image[7].value}
					});
			var pointsJson = JSON.stringify(points);
			    features(points);
			
			  	  console.log(points[0].properties.url);		  
			    
			    
			    
			    
			    
			    
     			     console.log("_______________________________");
		             // lets do some JSON! 
			     var imageJson = JSON.stringify(image);
			     notes.push(changeType + ' ' + filePath);
			     
			     
			     
			     //Report('Change Repport--------------->  : ' + notes[notes.length-1] );
			     //Report('The Location of This Image is ------>:'+image.gps[5].tagName);
			     //console.log(imageJson);
			     console.log("-------------------------------");
 
			    }		     
		      });
		     
			    
		     
		     
		     
		 } catch (error) {
		     console.log('Error (while extracting location data from the image): ' + error);
		 }	

	    }	
		
        }
    },
    next: function(err,watchers){
        if (err) {
            return console.log("watching everything failed with error", err);
        } else {
            //console.log('watching everything completed', watchers);
	    return console.log('watching everything completed');
        }
    }
    
});


