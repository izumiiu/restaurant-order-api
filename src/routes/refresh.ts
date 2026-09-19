import  express  from "express";
const router = express.Router();
import handleRefresh from "../controller/refreshController.js";

router.route('/').post(handleRefresh);

export default router;