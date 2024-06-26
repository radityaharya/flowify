import { prettyPath } from "@/middlewares/handlers/prettyPath";
import { withUserApi } from "@/middlewares/handlers/userApi";
import { middlewareHandler } from "@/middlewares/middlewareHandler";

const middlewares = [withUserApi, prettyPath];
export default middlewareHandler(middlewares);

// export const config = {
//   matcher: ["/api/:path*", "/workflow/:path*"],
// };
