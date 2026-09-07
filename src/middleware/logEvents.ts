
import type { RequestHandler } from "express";

const logger: RequestHandler = (req, res, next) => {
    const start = Date.now();
    console.log(`req method: ${req.method} and req path: ${req.path} `);
    next();
    console.log(Date.now() - start);

}

export default logger