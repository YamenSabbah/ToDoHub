import { prisma } from "../../lib/prisma.ts";
export const userResolvers = {
    getUser: async (_,context) => {
      if (!context.user) {
          throw new Error("Unauthorized");
      }
      const user = await prisma.user.findUnique({
          where: { id: context.user.id },
      });
      console.log(user)
      if (!user) {
          throw new Error("User not found");
      }
      return {
         id:user.id
      };
    }
};
