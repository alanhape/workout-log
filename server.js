var mysql = require('mysql')
// Let’s make node/socketio listen on port 3000
var io = require('socket.io').listen(3000)
// Define our db creds
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
	password: 'mynewpassword',
    database: 'test'
})


db.connect(function(err){
    if (err) console.log(err)
})
 
// Define/initialize our global vars
var rows = [];
var names = [];
var isInit = false;
var socketCount = 0;
 
io.sockets.on('connection', function(socket){
    // Socket has connected, increase socket count
    socketCount++
    // Let all sockets know how many are connected
    io.sockets.emit('users connected', socketCount)
 
    socket.on('disconnect', function() {
        // Decrease the socket count on a disconnect, emit
        socketCount--
        io.sockets.emit('users connected', socketCount)
    })
 
    socket.on('new row', function(data){
        // New note added, push to all sockets and insert into db
        io.sockets.emit('new row', data)
        // Use node's db injection format to filter incoming data
        db.query('INSERT INTO test1 VALUES ("' +
                 data.exty + '","' +
                 data.mg + '","' +
                 data.exer + '","' +
                 data.wgt + '","' +                 
                 data.reps + '","' +
                 data.sets + '","' +
                 data.miles + '","' +
                 data.iso + '","' +
                 data.time + '","' +
                 data.date +
                 '");');
    })
    
    socket.on('new exercise', function(data){
        // New note added, push to all sockets and insert into db
        io.sockets.emit('new row', data)
        // Use node's db injection format to filter incoming data
        db.query('INSERT INTO names1 VALUES ("' +
                 data.n_id + '","' +
                 data.exname + '","' +
                 data.exnameN + '","' +
                 data.mg +
                 '");');
    });
    
    if (!isInit) {
        db.query('SELECT * FROM names1')
            .on('result', function(data){
                // Push results onto the notes array
                names.push(data);
            })
            .on('end', function(){
                // Only emit notes after query has been completed
                socket.emit('names', names)
            });
        db.query('SELECT * FROM test1')
            .on('result', function(data){
                // Push results onto the notes array
                rows.push(data);
            })
            .on('end', function(){
                // Only emit notes after query has been completed
                socket.emit('initial', rows)
            });
        isInit = true;
    } else {
        // Initial notes already exist, send out
        socket.emit('names', names)
        socket.emit('initial', rows)
    }
})
