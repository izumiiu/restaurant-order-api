import type { RequestHandler } from "express";
import mongoose from "mongoose";


export const healthChecker: RequestHandler = (req, res) => {
    const readyState = mongoose.connection.readyState;
    if(readyState !== 1){
        return res.status(503).json({ status: 'unavailable', db: readyState });
    }
    return res.status(200).json({ message: "server and db connection is ok"});
    
}