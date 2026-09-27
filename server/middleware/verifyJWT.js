import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    try {
        // console.log(req.headers);
        // console.log(req.headers.authorization);
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expire Token"
        });
    }
}
export default verifyJWT;