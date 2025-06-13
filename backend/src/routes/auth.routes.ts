import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed, name });
  res.status(201).json(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ token });
});

export default router;
