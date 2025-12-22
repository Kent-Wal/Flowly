import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

//register a new user
router.post('/register', async (req, res) => {
    const {name, email, password} = req.body;

    //encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    //add name, email, password to the database
    try{
        //send the data to prisma
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name: name
            }
        });

        //create the token for the user
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'});

        //return the status and the token to the browser
        res.status(201).json({token});
    }
    catch(err){
        console.log(err.message);
        res.status(503).json({error: 'Service Unavailable'})
    }
});

//login a user
router.post('/login', (req, res) =>{
    const {email, password} = req.body;

    //encrypt password the user entered because we need to check it with a password that is already encrypted in the database

});



export default router;