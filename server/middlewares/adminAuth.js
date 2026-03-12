export const adminOnly = async (req, res, next) => {
    try {
        const { userId } = await req.auth();
        if (!userId || userId !== process.env.ADMIN_USER_ID) {
            return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
        }
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: error.message });
    }
};
