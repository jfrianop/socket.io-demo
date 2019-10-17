const mongoose = require("mongoose");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });

mongoose.connection.on("error", function (e) { console.error(e); });

//Project Schema
const messageSchema = mongoose.Schema({
    body: {
        type: String,
        required: [true, "is required"]
    },
    createdAt: Date
});

//ProjectModel
const Message = mongoose.model("Messages", messageSchema);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    io.emit("login", "");
    Message.find((err, messages) => {
        messages.forEach(message => {
            io.emit('message', message.body)
        });
    });

    socket.on('message', function (msg) {
        const message = { body: msg, createdAt: new Date() }
        Message.create(message).then(message => {
            io.emit('message', message.body)
        })
    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});


// app.post("/projects", async (req, res, next) => {
//     const newProject = req.body;
//     newProject.creationDate = new Date();

//     try {
//         const project = await Project.create(newProject)
//         res.json(project);
//     } catch (err) {
//         if (err.name === "ValidationError") {
//             res.status(422).json({ errors: err.errors });
//         } else {
//             next(err);
//         }
//     }
// });



http.listen(3001, function () {
    console.log('listening on *:3001');
});