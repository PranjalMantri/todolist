import connectDb from "./db/db.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 3000;

connectDb()
  .then(() => {
    app.on("error", (error) => {
      throw error;
    });

    app.listen(port, () => {
      console.log(`Server Listening on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log(
      "Something went wrong while connecting to database: ",
      error.message
    );
  });
