const express = require('express');
const ejs = require('ejs');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');
const fs = require("fs");

const founder = "Senior Dev Omis";


//IMAGE UPLOAD
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "" + Date.now() + "_" + file.originalname);
    },
});
var upload = multer({
    storage: storage,
}).single('image');


//INSERT INTO THE DATABASE 
router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    let output;
    (async () => {
        output = await user.save();
    });
    user.save();
    req.session.message = {
        type: "Success",
        message: "User added successfully!"
    }
    res.redirect("/");
});

//Get all data from Database
router.get("/", (req, res) => {

    User.find({}).then((users) => {
        res.render("index", { title: "Home Page", users: users });
    }).catch((err) => {
        console.log(eer);
    });

});

//Add User Page
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

//About Page
router.get("/about", function (req, res) {
    res.render("about", { 
        title: "About",
        subhead: "Created by",
        founder: founder     
});
});

//Contact Page
router.get("/contact", function (req, res) {
    res.render("about", { 
        title: "Contact Me",
        subhead: "featured",
        founder: "Call on following Number: 08114175313"});
});

router.get('/edit/:id', (req, res) => {

    let id = req.params.id;

    User.findById(id).then((user) => {
        if (user == null) {
            res.redirect('/')
        } else {
            res.render('edit_users', {title: "Edit User", user: user});
        }
        }).catch((err) =>{
            console.log(err);
            console.log("big error")
        });
});

//Update User Rout
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';

    if(req.file){
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image);
        } catch (error) {
            console.log(error)
        }
    }else{
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    }).then((result) =>{
        req.session.message = {
            type: 'Success',
            message: 'User updated successfully'
        }
        res.redirect("/");
    }).catch((err) => {
        res.json({message: err.message, type: 'danger'})
    });
});

// Delete Users From Database
router.get('/delete/:id', (req,res)=>{
    
    let id = req.params.id;

    User.findByIdAndRemove(id).then((result)=>{
        
        if(result.image != ''){
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (error) {
                console.log(error);
            }
        }else{
            req.session.message = {
                type: 'Success',
                message: 'User deleted successfully'
            }
        }
        res.redirect("/");
    }).catch((error)=>{
        res.json({message: error.message})
    })
})

module.exports = router;