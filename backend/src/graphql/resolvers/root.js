import { userResolvers } from "./userResolvers.js";
import { authResolver } from "./authResolvers.js";

export const root = {
    ...userResolvers,
    ...authResolver,
}