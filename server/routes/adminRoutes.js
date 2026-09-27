import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import authorizeRole from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/dashboard", verifyJWT, authorizeRole("Admin"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Wellcome to Admin Dashboard",
        user: req.user,
    });
}
);

export default router;