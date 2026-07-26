import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/generateToken.js";
export const authResolver = {
    login: async ({ email, password }, context) => {
        console.log(email)
        const user = await prisma.user.findUnique({ where: { email } });
       
        if (!user) {
            throw new Error("User not found");
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error("Invalid password");
        }

        const token = generateToken(user.id);
        context.res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24
        });
        return {
            user: {
                id: user.id,
                username: user.username,
                email
            }
        };

    },
    register: async ({ name, email, password }, context) => {
        const existsUser = await prisma.user.findUnique({ where: { email } });
        if (existsUser) {
            throw new Error("User already exists");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({ data: { username: name, email, password: hashedPassword } });
        const token = generateToken(user.id);
        context.res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24
        });
        return {
            user: {
                username: name,
                email
            }
        };
    },
    logout: async (_, context) => {
        context.res.clearCookie("token" , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return "User logged out successfully";
    }
}   