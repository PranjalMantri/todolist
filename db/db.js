import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDb() {
  await mongoose
    .connect(process.env.DATABASE_CONNECTION_STRING)
    .then(() => {
      console.log("Successfuly established a connection to the database");
    })
    .catch((error) => {
      console.log(
        "Something went wrong while connecting to the database: ",
        error
      );
      process.exit(1);
    });
}

export default connectDb;
