import argon2 from "argon2";
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../utils/generateToken.js";
export const authResolver = {
    login: async ({ email, password }, context) => {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new Error("Invalid email or password");
        }
        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            throw new Error("Invalid email or password");
        }

        const token = generateToken(user.id);
        context.res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60
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
        const hashedPassword = await argon2.hash(password);
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
        context.res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        return "User logged out successfully";
    }
}   