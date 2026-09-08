import type { RequestHandler } from "express";
import bcrypt from 'bcrypt';
import User from '../model/User.js';


const handleNewUser: RequestHandler = async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.status(400).json({ 'message': "Username and password are required,"});

    // check for duplicate username in the db
    const duplicate = await User.findOne({ username: user }).exec();

    if(duplicate) return res.sendStatus(409); //Conflict
    try{
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pass, 10);

        //create and store the new user
        const result = await User.create({ 
            "username": user, 
            "password": hashedPwd  
        });

        console.log(result);
        
        res.status(201).json({ 'success': `New user ${user} created!` }); 

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        res.status(500).json({ 'message': message });
    }
}

export default handleNewUser;

