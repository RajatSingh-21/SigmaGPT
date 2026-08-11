import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import "dotenv/config";
import express from "express";
import User from "../models/user.js";
import auth from "../middleware.js"

const router = express.Router();
//Signup
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: "Email already registered" });
            }
            return res.status(400).json({ error: "Username already taken" });
        }
        const hashed = await bcrypt.hash(password, 10);//to protect

        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashed,
        })
        await newUser.save();

        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
        const userPayload = { userId: newUser._id }
        const token = jwt.sign(userPayload, JWT_SECRET_KEY, { expiresIn: '7d' })
        res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Signup failed" });
    }
})
//Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: "7d" });
        res.json({ token, username: user.username });
    } catch (err) {
        console.log(err);
        // res.redirect("/login")
        res.status(500).send("Login failed");
    }
});
export default router;