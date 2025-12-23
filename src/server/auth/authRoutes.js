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
        return res.status(201).json({token});
    }
    catch(err){
        console.log(err.message);
        return res.status(503).json({error: 'Service Unavailable'})
    }
});

//login a user
router.post('/login', async (req, res) =>{
    const {email, password} = req.body;

    try{
        //check to make sure the email entered exists
        const userFound = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if(!userFound){
            return res.status(404).send({message: 'User not found.'});
        }

        //encrypt password the user entered because we need to check it with a password that is already encrypted in the database
        const validPassword = bcrypt.compareSync(password, userFound.password);

        if(!validPassword){
            return res.status(401).send({message: 'Incorrect Password.'});
        }

        //return the logged in user
        console.log(userFound);

        //now we can create the token because only valid users are left
        const token = jwt.sign({id: userFound.id}, process.env.JWT_SECRET, {expiresIn: '24h'});

        //return token and status
        return res.status(200).json({token});
    }
    catch(err){
        console.log(err.message);
        return res.send(503).json({error: 'Service Unavailable'});
    }
     
});

export default router;