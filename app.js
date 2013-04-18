// Require
var watchr = require('watchr');
var fs = require('fs'),
    http = require('http'),
    sio = require('socket.io');
    

var server = http.createServer(function(req, res) {
  res.writeHead(200, { 'Content-type': 'text/html'});
  res.end(fs.readFileSync('./index.html'));
});

server.listen(3698, function() {
  console.log('Server listening at http://localhost:3698');
});

// Attach the socket.io server
io = sio.listen(server);

//to keep track of the masseges on the chat
var messages = [];
//to transport the images information!
var notes = [];

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
	})
    });  
				
    function Report(notes) {
	io.sockets.emit('notes', notes);
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
	    
	    
	    
	    console.log("___________File Change Info.______________");
	    console.log('Notes--------------->: ' + notes[notes.length-1]);
	    console.log('change type--------->: ' + changeType);
	    console.log('file Curren tStat--->: ' + fileCurrentStat);
	    console.log('file Previous Stat-->: ' + filePreviousStat);
	    
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
			   
			     //console.log(image);
			     console.log("_______________________________");
		 
			     console.log(image.gps[5].tagName); // Do something with your data!
			     console.log(image.gps[5].value);
			    
			     console.log("-------------------------------");
                            
     			     console.log("_______________________________");
		             // lets do some JSON! 
			     var imageJson = JSON.stringify(image);
			     notes.push(changeType + ' ' + filePath);
			     Report('Change Repport--------------->  : ' + notes[notes.length-1] );
			     Report('The Location of This Image is ------>:'+image.gps[5].tagName);
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


