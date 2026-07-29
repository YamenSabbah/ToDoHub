import { userResolvers } from "./userResolvers.js";
import { authResolver } from "./authResolvers.js";
import { taskResolvers } from "./taskResolvers.js";

export const root = {
    ...userResolvers,
    ...authResolver,
    ...taskResolvers,
}