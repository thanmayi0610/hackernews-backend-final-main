import "dotenv/config"; // Load .env first
import { serve } from "@hono/node-server";
import { allroutes } from "./routes/routes";


serve(allroutes, (info) => {
  console.log(`Server Running @ http://localhost:${info.port}`);
});