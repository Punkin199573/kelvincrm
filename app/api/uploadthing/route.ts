import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core"; // Assuming core.ts is in the same folder

export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
