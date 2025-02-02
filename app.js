import express from "express";
import mongoose from "mongoose";
import z from "zod";
import { User } from "./models/user.schema.js";
import { Todo } from "./models/todo.schema.js";
import jwt from "jsonwebtoken";
import verifyJWT from "./auth/auth.js";

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

  const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);

  res.status(200).json({
    success: true,
    message: "Successfuly logged in user",
    data: token,
  });
});

app.get("/todos", verifyJWT, async (req, res) => {
  const userId = req.userId;

  console.log(userId);

  const todos = await Todo.find({
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!todos || todos.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No todos found",
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly fetched all the todos",
    data: todos,
  });
});

app.post("/todo", verifyJWT, async (req, res) => {
  const userId = req.userId;

  const { body, isCompleted } = req.body;

  const todo = await Todo.create({
    userId: new mongoose.Types.ObjectId(userId),
    body: body,
    isCompleted: Boolean(isCompleted) || false,
  });

  if (!todo) {
    return res.status(503).json({
      success: false,
      message: "Something went wrong while creating a todo",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly created the todo",
    data: todo,
  });
});

app.patch("/todo/:id", verifyJWT, async (req, res) => {
  const todoId = req.params.id;
  const { body } = req.body;

  if (!todoId) {
    return res.status(400).json({
      success: false,
      message: "Todo Id is required",
    });
  }

  const todo = await Todo.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(todoId) },
    { body: body },
    { new: true }
  );

  if (!todoId) {
    return res.status(400).json({
      success: false,
      message: "Invalid todo Id",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly updated the todo",
    data: todo,
  });
});

app.delete("/todo/:id", verifyJWT, async (req, res) => {
  const todoId = req.params.id;

  if (!todoId) {
    return res.status(400).json({
      success: false,
      message: "Todo Id is required",
    });
  }

  const todo = await Todo.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(todoId),
  });

  if (!todoId) {
    return res.status(400).json({
      success: false,
      message: "Invalid todo Id",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly deleted the todo",
  });
});

app.get("/todos/completed", verifyJWT, async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(404).json({
      success: true,
      message: "User does not exist",
    });
  }

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        isCompleted: true,
      },
    },
  ];

  const todos = await Todo.aggregate(pipeline);

  if (!todos || todos.length == 0) {
    return res.status(400).json({
      success: false,
      message: "User has no completed todos",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly found all the todos",
    data: todos,
  });
});

export default app;
