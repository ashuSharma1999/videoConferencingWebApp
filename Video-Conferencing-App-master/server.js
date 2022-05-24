const express = require("express");
var nodemailer = require('nodemailer');
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});
const { userJoin, getCurrentUser, userLeave, getUsers } = require('./utils/users');
const { ExpressPeerServer } = require("peer");
const { Console } = require("console");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

// Function to send an invitation mail to team members 
function sent_mail(mail_id, link) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'yoyotarunxd@gmail.com',
            pass: 'tarun8001'
        }
    });

    var mailOptions = {
        from: 'yoyotarunxd@gmail.com',
        to: mail_id,
        subject: 'Invitation link to join the team !!',
        text: link
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.engine('html', require('ejs').renderFile);

// Render the first landing page
app.get('/', function(req, res) {
    res.render("index.html");
});

// Render the feedback form after leaving the call
app.get('/feedback', function(req, res) {
    res.render("feedback.html");
});

// Creating a unique ID for new room 
app.get("/direct", (req, rsp) => {
    rsp.redirect(`/${uuidv4()}`);
});

// Joining the room generated via unique Id 
app.get("/:room", (req, res) => {
    roomId = `/${uuidv4()}`;
    console.log(roomId);
    res.render("room", { roomId: req.params.room });
});


// When connection happens 
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        const user = userJoin(socket.id, userName, roomId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);
        io.to(roomId).emit('Users', {
            users: getUsers(roomId)
        });

        socket.on("message", (message, time) => {
            io.to(roomId).emit("createMessage", message, userName, time);
        });

        /*socket.on("disconnect", () => {
          const user = userLeave(socket.id);
          io.to(roomId).emit('userLeft', userName);
          io.to(roomId).emit('Users',{
            users:getUsers(roomId)
          });
        });*/

        socket.on("initiate", () => {
            io.to(roomId).emit("share-screen");
        });

        socket.on("mail_sent", (mail_id, link) => {
            sent_mail(mail_id, link);
            io.to(roomId).emit("success");
        });
    });
});

server.listen(process.env.PORT || 80);