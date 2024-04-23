import { withUserApi } from "@/middlewares/handlers/userApi";
import { middlewareHandler } from "@/middlewares/middlewareHandler";

const middlewares = [withUserApi];
export default middlewareHandler(middlewares);
