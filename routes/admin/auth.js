// const express = require('express');
// const {check,validationResult} = require('express-validator');


// const usersRepo = require('../../repositories/users');
// const signupTemplate = require('../../views/admin/auth/signup');
// const signinTemplate = require('../../views/admin/auth/signin');
// const router = express.Router();


// router.get('/signup', (req,res) => {
//     res.send(signupTemplate( { req } ));
// });


// router.post('/signup',
// [
//  check('email')
//     .trim()
//     .normalizeEmail()
//     .isEmail()
//     .withMessage('Must be a valid Email')
//     .custom(async email => {
//         const existingUser = await usersRepo.getByOne({email});
//         console.log(existingUser);
//         if(existingUser) {
//            throw new Error('That email is already in use');
//         }
//     }),
//  check('password')
//     .trim()
//     .isLength({min:4, max: 20})
//     .withMessage('Must be between 4 and 20 characters'), 
//  check('passwordConf')
//     .trim()
//     .isLength({min:4, max: 20})
//     .withMessage('Must be between 4 and 20 characters')
//     .custom((passwordConf, {req}) => {
//         if(req.password !== passwordConf) {
//             throw new Error('Passwords do not match!');
           
//         }
//     })
// ],
//  async (req,res) => {
//     const errors = validationResult(req);
//     console.log(errors);

//     const {email, password, passwordConf} = req.body;

//  const user = await usersRepo.create({email, password});
   

//  //store the id of that user inside the users cookie
// //  req.session === {} //added by the cookie session

// req.session.userID = user.id;

// res.send('Account succesfully created!!!')

// });

// router.get('/signout', (req, res) => {
//     req.session = null;
//     res.send('You are now logged out!')
// });

// router.get('/signin', (req, res) => {
//     res.send(signinTemplate( { req } ) )
// });

// router.post('/signin', async (req, res) => {
//     const {email, password} = req.body;

//     const user = await usersRepo.getByOne({email});
    
//     const validPassword = await usersRepo.comparePasswords(user.password, password)

//     if(!user) {
//        return res.send('user does not exist');
//     }

//     if(validPassword) {
//         req.session.userID = user.id;
//        return res.send(`You've Been logged in!`);
//     }else {
//       return res.send('incorrect password. Try Again.')
//     }
    
// })


//  module.exports = router;

const express = require('express');
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');

const router = express.Router();

router.get('/signup', (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  '/signup',
  [
    check('email')
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Must be a valid email')
      .custom(async email => {
        const existingUser = await usersRepo.getOneBy({ email });
        if (existingUser) {
          throw new Error('Email in use');
        }
      }),
    check('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Must be between 4 and 20 characters'),
    check('passwordConfirmation')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Must be between 4 and 20 characters')
      .custom((passwordConfirmation, { req }) => {
        if (passwordConfirmation !== req.body.password) {
          throw new Error('Passwords must match');
        }
      })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);

    const { email, password, passwordConfirmation } = req.body;
    const user = await usersRepo.create({ email, password });

    req.session.userId = user.id;

    res.send('Account created!!!');
  }
);

router.get('/signout', (req, res) => {
  req.session = null;
  res.send('You are logged out');
});

router.get('/signin', (req, res) => {
  res.send(signinTemplate());
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepo.getOneBy({ email });

  if (!user) {
    return res.send('Email not found');
  }

  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );
  if (!validPassword) {
    return res.send('Invalid password');
  }

  req.session.userId = user.id;

  res.send('You are signed in!!!');
});

module.exports = router;