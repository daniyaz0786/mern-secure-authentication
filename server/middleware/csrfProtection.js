const csrfProtection = (req, res, next) => {
    const allowedOrigin = "http://localhost:3000";

    const origin = req.headers.origin;

    if (
        origin &&
        origin !== allowedOrigin
    ) {
        return res.status(403).json({
            success: false,
            message: "CSRF protection: Invalid origin",
        });
    }

    next();
};

export default csrfProtection;