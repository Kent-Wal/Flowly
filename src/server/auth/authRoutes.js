import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

//register a new user
router.post('/register', (req, res) => {
    const {name, email, password} = req.body;

});

//login a user
router.post('/login', (req, res) =>{
    const {email, password} = req.body;

    //encrypt password the user entered because we need to check it with a password that is already encrypted in the database
    
});



export default router;