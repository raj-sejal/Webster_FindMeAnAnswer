const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    methodOverride = require("method-override");

// Requiring Schemas
const Question = require("./models/questions"),
    Comment = require("./models/comments"),
    Answer = require("./models/answer"),
    User = require("./models/user");

//APP CONFIG
mongoose.connect('mongodb://localhost:27017/find-answers', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB!')).catch(error => console.log(error.message));

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.locals.moment = require('moment');
//Passport Configuration
app.use(require("express-session")({
    secret: "Best course on web devlopment by Colt Steele",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Adding CurrentUser to every template at once
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});


//===========================
//RESTFULL ROUTES
//===========================

//Landing Page
app.get("/", function (req, res) {
    res.render("landing");
});

//====================
//INDEX ROUTES
//====================
//INDEX - Showing all the question with basic detail - GET
app.get("/khojo", function (req, res) {
    Question.find({}, function (err, allQuestion) {
        if (err) {
            console.log(err);
        } else {
            res.render("questions/index", { question: allQuestion });
        }
    });
});

//NEW - Show Form to create a new question - GET
app.get("/khojo/new", isLoggedIn, function (req, res) {
    res.render("questions/new");
});

//CREATE - Add A New Question To The Database - POST
app.post("/khojo", isLoggedIn, function (req, res) {
    let question = req.body.question;
    let description = req.body.description;
    let subject = req.body.subject;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newCampGround = { question: question, subject: subject, description: description, author: author };
    Question.create(newCampGround, function (err, newQuestion) {
        if (err) {
            console.log(err);
        } else {
            newQuestion.save();
            res.redirect("/khojo");
        }
    });
});

//SHOW - Show Particular Question with All its detail - GET
app.get("/khojo/:id", function (req, res) {
    Question.findById(req.params.id).populate("answer").populate("comments").exec(function (err, foundQuestion) {
        if (err) {
            console.log(err);
        } else {
            res.render("questions/show", { question: foundQuestion });
        }
    });
});

//EDIT - Edit particular question - GET
app.get("/khojo/:id/edit", checkQuestionOwnership, function (req, res) {
    Question.findById(req.params.id, function (err, foundQuestion) {
        res.render("questions/edit", { question: foundQuestion });
    });
});

//UPDATE - Updates the question - PUT
app.put("/khojo/:id", checkQuestionOwnership, function (req, res) {
    Question.findByIdAndUpdate(req.params.id, req.body.question, function (err, updatedQuestion) {
        if (err) {
            res.redirect("/khojo");
        } else {
            res.redirect("/khojo/" + req.params.id);
        }
    });
});

//DESTROY - Deletes question - DELETE
app.delete("/khojo/:id", checkQuestionOwnership, function (req, res) {
    Question.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/khojo");
        } else {
            res.redirect("/khojo");
        }
    });
});

//=========================
//COMMENTS ROUTE
//=========================
//NEW - Adding a comment
app.get("/khojo/:id/comments/new", isLoggedIn, function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { question: question });
        }
    });
});

//CREATE - Creating a comment
app.post("/khojo/:id/comments", isLoggedIn, function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
            res.redirect("/khojo");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                    res.redirect('/khojo/' + question._id + '/comments/new');
                } else {
                    // Add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // Save comment
                    comment.save();
                    question.comments.push(comment);
                    question.save();
                    res.redirect('/khojo/' + question._id);
                }
            });
        }
    });
});

//EDIT - comment - GET ROUTE
app.get("/khojo/:id/comments/:comment_id/edit", checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { question_id: req.params.id, comment: foundComment });
        }
    });
});

//UPDATE - comment - PUT ROUTE
app.put("/khojo/:id/comments/:comment_id", checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/khojo/" + req.params.id);
        }
    });
});

//DESTROY - comment - DELETE ROUTE
app.delete("/khojo/:id/comments/:comment_id", checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/khojo/" + req.params.id);
        }
    });
});

//===================
// Answer Routes
//===================
//NEW - Open The Answer Form - GET
app.get("/khojo/:id/answer/new", function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
        } else {
            res.render("answer/new", { question: question });
        }
    });
});

//CREATE - Creating an answer
app.post("/khojo/:id/answer", isLoggedIn, function (req, res) {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
            res.redirect("/khojo");
        } else {
            Answer.create(req.body.answer, function (err, answer) {
                if (err) {
                    console.log(err);
                    res.redirect('/khojo/' + question._id + '/answer/new');
                } else {
                    // Add username and id to Answer
                    answer.author.id = req.user._id;
                    answer.author.username = req.user.username;
                    // Save Answer
                    answer.save();
                    question.answer.push(answer);
                    question.save();
                    res.redirect('/khojo/' + question._id);
                }
            });
        }
    });
});

//EDIT - Editing an answer - GET ROUTE
app.get("/khojo/:id/answer/:answer_id/edit", function (req, res) {
    Answer.findById(req.params.answer_id, function (err, foundAnswer) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("answer/edit", { question_id: req.params.id, answer: foundAnswer });
        }
    });
});

//UPDATE - Updating the answer - PUT ROUTE
app.put("/khojo/:id/answer/:answer_id", function (req, res) {
    Answer.findByIdAndUpdate(req.params.answer_id, req.body.answer, function (err, updatedAnswer) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/khojo/" + req.params.id);
        }
    });
});

//DESTROY - Deleting the answer - DELETE ROUTE
app.delete("/khojo/:id/answer/:answer_id", function (req, res) {
    Answer.findByIdAndRemove(req.params.answer_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/khojo/" + req.params.id);
        }
    });
});

//===================
//AUTH ROUTES
//===================
//SIGN UP - Form
app.get("/signup", function (req, res) {
    res.render("user/signup")
});

//SIGN UP - Logic
app.post("/signup", function (req, res) {
    const newUser = new User({ username: req.body.username });
    if (req.body.isTeacher === "true") {
        newUser.isTeacher = true;
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.redirect("/signup");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/khojo");
        })
    });
});

//SIGN IN - Form
app.get("/signin", function (req, res) {
    res.render("user/signin");
});

//SING IN - Logic
app.post("/signin", passport.authenticate("local",
    {
        successRedirect: "/khojo",
        failureRedirect: "/signin"
    }), function (req, res) { }
);

// SIGN OUT - Logic
app.get("/signout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/signin");
}

function checkQuestionOwnership(req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        Question.findById(req.params.id, function (err, foundQuestion) {
            if (err) {
                res.redirect("back");
            }
            else {
                if (foundQuestion.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

function checkCommentOwnership(req, res, next) {
    // is user logged in
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            }
            else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}


//===================
// EXTRA ROUTES
//===================
// app.get("/khojo/subjects", function (req, res) {
//     res.render("subjects/subjects");
// });
// app.get("/khojo/teachers", function (req, res) {
//     res.render("teachers/teachers");
// });


//===================
//SERVER LISTENING
//===================
app.listen(3000, function () {
    console.log("Server has started on port 3000");
});