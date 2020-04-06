const express = require('express');
const {check,validationResult} = require('express-validator');


const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const router = express.Router();


router.get('/signup', (req,res) => {
    res.send(signupTemplate( { req } ));
});


router.post('/signup',
[
 check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must be a valid Email')
    .custom(async email => {
        const existingUser = await usersRepo.getByOne({email});
        if(existingUser) {
           throw new Error('That email is already in use');
        }
    }),
 check('password')
    .trim()
    .isLength({min:4, max: 20})
    .withMessage('Must be between 4 and 20 characters'), 
 check('passwordConf')
    .trim()
    .isLength({min:4, max: 20})
    .withMessage('Must be between 4 and 20 characters')
    .custom((passwordConf, {req}) => {
        console.log(req.body.password)
        if(passwordConf !== req.body.password) {
            throw new Error('Passwords do not match!');
           
        }else {
            return true;
        }
    })
],
 async (req,res) => {
    const errors = validationResult(req);
     console.log(errors);
    if(!errors.isEmpty()) {
        return res.send(signupTemplate({req, errors}));
    }

    const {email, password, passwordConf} = req.body;

 const user = await usersRepo.create({email, password});
   

 //store the id of that user inside the users cookie
//  req.session === {} //added by the cookie session

req.session.userID = user.id;

res.send('Account succesfully created!!!')

});

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('You are now logged out!')
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate( { req } ) )
});

router.post('/signin', 
[
    check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must provide a valid email')
    .custom(async (email) => {
        const user = await usersRepo.getByOne({email});

        if(!user) {
            throw new Error('Email not found')
        }else {
            return true;
        }
    }),
    check('password')
    .trim()
    .custom(async (password, {req}) => {
        const user = await usersRepo.getByOne({email: req.body.email});

        const validPassword = await usersRepo.comparePasswords(user.password, password)

        if(!validPassword) {
            throw new Error('Incorrect password!');
        }
    })
    
],
    async (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
       if(!errors.isEmpty()) {
           return res.send(signinTemplate({req, errors}));
       }

    // const {email, password} = req.body;

    // const user = await usersRepo.getByOne({email});
    
    // const validPassword = await usersRepo.comparePasswords(user.password, password)

    // if(!user) {
    //    return res.send('user does not exist');
    // }

    // if(validPassword) {
    //     req.session.userID = user.id;
    //    return res.send(`You've Been logged in!`);
    // }else {
    //   return res.send('incorrect password. Try Again.')
    // }
    
})


 module.exports = router;



