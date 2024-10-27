import express from "express";
import z from "zod";
import { User } from "./models/user.schema.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const usernameSchema = z
  .string()
  .min(6, { message: "Username should contain at least 6 characters" });

const emailSchema = z.string().email();

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be 9 characters long" })
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password should include at least one uppercase character",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password should include at least one lowercase character",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password should include at least one number",
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: "Password should include at least one special characters",
  });

const userSchemea = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  const parsedUser = userSchemea.safeParse({ username, email, password });

  if (!parsedUser.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid Credentials: ",
      errors: parsedUser.error.errors.map((error) => error.message),
    });
  }

  const user = await User.create({ username, email, password });

  return res.status(200).json({
    success: true,
    message: "Successfuly created a user",
    data: user,
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const parsedEmail = emailSchema.safeParse(email);
  const parsedPassword = passwordSchema.safeParse(password);

  if (!parsedEmail.success) {
    return res.status(400).json({
      success: false,
      message: parsedEmail.error.errors.map((error) => error.message),
    });
  }

  if (!parsedPassword.success) {
    return res.status(400).json({
      success: false,
      message: parsedPassword.error.errors.map((error) => error.message),
    });
  }

  const existingUser = await User.findOne({ email, password });

  if (!existingUser) {
    return res.status(400).json({
      success: false,
      message: "User doesn't exist",
    });
  }

  const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);

  res.status(200).json({
    success: true,
    message: "Successfuly logged in user",
    data: token,
  });
});

// app.get("/todos", (req, res) => {});
// app.post("/todo", (req, res) => {});
// app.get("/todo/:id", (req, res) => {});
// app.patch("/todo/:id", (req, res) => {});
// app.delete("/todo/:id", (req, res) => {});
// app.get("/todos/completed", (req, res) => {});

export default app;
