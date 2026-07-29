import { prisma } from "../../lib/prisma.js";

export const taskResolvers = {
    createTask: async ({ name, description, day }, context) => {

        if (!context.user) {
            throw new Error("Unauthorized");
        }
        const task = await prisma.task.create({
            data: {
                name: name,
                description: description,
                day: day,
                isCompleted: false,
                createdAt: new Date().toISOString(),
                user: {
                    connect: {
                        id: context.user.id,
                    }
                }


            },
        });
        return task;
    },

    getAllTasks: async (_, context) => {
        if (!context.user) {
            throw new Error("Unauthorized");
        }
        const tasks = await prisma.task.findMany({
            where: { userId: context.user.id },
        });
        return tasks;
    },

    updateTaskChecked: async ({ id, isCompleted }, context) => {
        if (!context.user) {
            throw new Error("Unauthorized");
        }

        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
        if (!task) {
            throw new Error("Task not found");
        }
        if (task.userId !== context.user.id) {
            throw new Error("Unauthorized");
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { isCompleted },
        });
        return updatedTask;
    },
    editTask: async ({ id, name, description, day }, context) => {
        if (!context.user) {
            throw new Error("Unauthorized");
        }

        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
        if (!task) {
            throw new Error("Task not found");
        }
        if (task.userId !== context.user.id) {
            throw new Error("Unauthorized");
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { name, description, day },
        });
        return updatedTask;
    },
    deleteTask: async ({ id }, context) => {
        if (!context.user) {
            throw new Error("Unauthorized");
        }

        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
        if (!task) {
            throw new Error("Task not found");
        }
        if (task.userId !== context.user.id) {
            throw new Error("Unauthorized");
        }

        await prisma.task.delete({ where: { id: parseInt(id) } });
        return "Task deleted successfully";
    },

}
