const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const ytdl = require('ytdl-core');
const path = require('path');
const auth = require('./api/routes/auth');
const users = require('./api/routes/users');
const {user} = require('./api/models/user_model');

// These are the modules that I had trouble trying to properly make work
// const session = require('express-session');
// const connectMongo = require('connect-mongo')(session);
// const bcrypt = require('bcrypt');
// const multer = require('multer');

mongoose.connect('mongodb+srv://jtran:'+process.env.MONGO_ATLAS_PW+'@fpdb-cluster0-095uj.mongodb.net/test?retryWrites=true&w=majority', 
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error: ', err));

// This is my multer attempt, essentially what we had learned in class but modified for audio/video files with the mimetypes
// const myStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './downloads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });

// const myFilter = (req, file, cb) => {
//     if (file.mimetype === 'audio/mpeg' || file.mimetype === 'video/mp4') {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// const download = multer({
//     storage: myStorage,
//     limits: {
//         fileSize: 1024 * 1024 * 300
//     },
//     fileFilter: myFilter
// });

app.use(cors());

app.listen(3000, () => {
    console.log('Server Up and Running at Port 3000');
});

app.use(morgan('dev'));

// This is my express-session and connect-mongo attempt at creating proper user sessions in which does not work even after changing around settings/values
// app.use(session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: false,
//     store: new connectMongo(options)
// }));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    };
    next();
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));
});
app.use('/downloadmp4', express.static(__dirname + '/downloads'));
app.use('/downloadmp3', express.static(__dirname + '/downloads'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

app.use('/api/users', users);
app.use('/api/auth', auth);

app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    // This is my attempt at validating the hashed password with the password coming in from the request using bcrypt's function 'compare'
    // const hashedpw = bcrypt.compare(password, users.password);
    user.findOne({
        username: username,
        password: password},
        (err, user) => {
            if(err) {
                console.log(err);
                return res.status(500).json({
                    message: err.message
                });
            } else if(!user) {
                return res.status(401).json({
                    message: 'Incorrect Username or Password'
                });
                // I believe this validation isn't working because I do not have the proper hashed password coming from users.js
            } /*else if (password === hashedpw || password === password) {
                return res.sendFile(__dirname + '/ytdownloader.html');
            }*/
            return res.sendFile(__dirname + '/ytdownloader.html');
        },
    );
});

// This is my multer attempt continued
app.get('/downloadmp4', /*download.single('videoMP4'),*/ (req, res) => {
    // console.log(req.file);
    var ytURL = req.query.URL;
    ytdl.getInfo(ytURL, (err, info) => {
        if (err) throw err;
        console.log(info.title);
    });
    res.header('Content-Disposition', `attachment; filename="ytvideo.mp4"`);
    ytdl(ytURL, {format: 'mp4'}).pipe(res);
});

// I believe this isn't working because the file may be invalid or undefined when trying to save to the folder
app.get('/downloadmp3', /*download.single('audioMP3'),*/ (req, res) => {
    // console.log(req.file);
    var ytURL = req.query.URL;
    ytdl.getInfo(ytURL, (err, info) => {
        if (err) throw err;
        console.log(info.title);
    });
    res.header('Content-Disposition', `attachment; filename="ytaudio.mp3"`);
    ytdl(ytURL, {format: 'mp3'}).pipe(res);
});

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;