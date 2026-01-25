import app from './app.js';
import { connectDB, syncDB } from "./db/connection.js";

(async () => {
  try {
    await connectDB();  
    await syncDB();     

    const port = app.get("port");
    app.listen(port, () => {
      console.log("Server on port", port);
    });
  } catch (error) {
    console.error(error);
  }
})();