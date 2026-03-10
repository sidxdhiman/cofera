import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jwt-simple"
import { readDb, writeDb } from "../utils/fileDb"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "cofera_super_secret"

const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) return res.status(401).json({ error: "No token provided" })
    try {
        const decoded = jwt.decode(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ error: "Invalid token" })
    }
}

router.post("/signup", async (req, res) => {
    try {
        const { username, password, email, name, empId, manager, project } = req.body
        if (!username || !password || !email) {
            return res.status(400).json({ error: "Username, password, and email are required" })
        }

        // Validate carehealth.com domain
        if (!email.toLowerCase().endsWith("@carehealth.com")) {
            return res.status(400).json({ error: "Email must be a valid @carehealth.com address" })
        }

        const users = readDb("users.json")
        if (users.find((u: any) => u.username === username)) {
            return res.status(400).json({ error: "Username already exists" })
        }
        if (users.find((u: any) => u.email === email.toLowerCase())) {
            return res.status(400).json({ error: "Email already registered" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = {
            id: Date.now().toString(),
            username,
            password: hashedPassword,
            email: email.toLowerCase(),
            name: name || username,
            empId: empId || `EMP-${Date.now().toString().slice(-6)}`,
            manager: manager || "",
            project: project || "",
            createdAt: new Date().toISOString()
        }

        users.push(newUser)
        writeDb("users.json", users)

        const token = jwt.encode({ id: newUser.id, username: newUser.username }, JWT_SECRET)
        const { password: _p, ...safeUser } = newUser
        res.status(201).json({ token, username: newUser.username, user: safeUser })
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
        const { password: _p, ...safeUser } = user
        res.json({ token, username: user.username, user: safeUser })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Server error" })
    }
})

router.get("/me", authMiddleware, (req: any, res: any) => {
    try {
        const users = readDb("users.json")
        const user = users.find((u: any) => u.id === req.user.id)
        if (!user) return res.status(404).json({ error: "User not found" })
        const { password: _p, ...safeUser } = user
        res.json(safeUser)
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
})

export default router
