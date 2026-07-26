import jwt from "jsonwebtoken";
export const generateToken = (id) => {
    const payload = {
        id: id
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    });
    return token;
    
}