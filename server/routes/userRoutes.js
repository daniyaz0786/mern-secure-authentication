import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import { profile } from "../controllers/userController.js";


const router = express.Router();

router.get("/profile", verifyJWT, profile)

export default router;