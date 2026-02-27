import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jwt-simple"
import { readDb, writeDb } from "../utils/fileDb"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "cofera_super_secret"

router.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" })
        }

        const users = readDb("users.json")
        if (users.find((u: any) => u.username === username)) {
            return res.status(400).json({ error: "Username already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword
        }

        users.push(newUser)
        writeDb("users.json", users)

        const token = jwt.encode({ id: newUser.id, username: newUser.username }, JWT_SECRET)
        res.status(201).json({ token, username: newUser.username })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body
        const users = readDb("users.json")
        const user = users.find((u: any) => u.username === username)

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" })
        }

        const token = jwt.encode({ id: user.id, username: user.username }, JWT_SECRET)
        res.json({ token, username: user.username })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
})

export default router
