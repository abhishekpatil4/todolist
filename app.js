//Database dependencies
const { GridFSBucketWriteStream } = require('mongodb');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const express = require('express');
const bodyParser = require('body-parser');
const app = express();


//To connect to the database
mongoose.connect('mongodb+srv://abhishek:LcAK2Nrz1CejTIf7@cluster0.7k55j13.mongodb.net/?retryWrites=true&w=majority').then(() => {
    console.log("Connected to the database!");
})
    .catch(err => {
        console.log(err);
    });


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Auth0 dependencies 
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

//Database Schema
const listSchema = new mongoose.Schema({
    content: String,
    date: String
});


//Connecting to the collection using the collection name
const List = mongoose.model("todolist", listSchema);

//Auth0 Configuration
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'https://todolist7.azurewebsites.net',
    // baseURL: 'https://localhost:3000',
    clientID: 'ZMrTV6x9GRIhrqmWevy8LEd3RR3cWyP0',
    issuerBaseURL: 'https://dev-4ew8bck655nqvoem.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

app.get("/", requiresAuth(), function (req, res) {
    if (!req.oidc.isAuthenticated()) {
        res.redirect("/login");
    }
    console.log(JSON.stringify(req.oidc.user));
    const data = JSON.stringify(req.oidc.user);
    var today = new Date();
    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    var day = today.toLocaleDateString("en-US", options);

    List.find(function (err, items) {
        if (err) {
            console.log(err);
        } else {
            res.render('list', { kindOfDay: day, newListItems: items, data: data });
        }
    });
});

app.post("/", function (req, res) {
    var item = new List({
        content: req.body.newItem,
        date: req.body.newItemDate
    });
    if (item.content != "") {
        item.save();
    }
    res.redirect("/");
})

app.post("/delete", function (req, res) {
    List.findByIdAndRemove(req.body.checkbox, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Item deleted ");
        }
    });
    res.redirect("/");
});

app.listen(port, function () {
    console.log("Server started on port 3000");
});