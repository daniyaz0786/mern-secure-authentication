export const profile = async (req, res) => {

    return res.json({
        success: true,
        message: "Protected Route",
        user: req.user
    });
}