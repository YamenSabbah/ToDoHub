import jwt from "jsonwebtoken";


export const authMiddleware = (req) => {
        console.log("COOKIE:", req.cookies);

    const token = req.cookies?.token;
    if (!token) return { user: null };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { user: decoded };
    } catch {
        return { user: null };
    }
};