import { middlewareHandler } from "@/middlewares/middlewareHandler";
import { withUserApi } from "@/middlewares/handlers/userApi";

const middlewares = [withUserApi];
export default middlewareHandler(middlewares);
