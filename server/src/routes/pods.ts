import express from "express"
import jwt from "jwt-simple"
import { readDb, writeDb } from "../utils/fileDb"
import fs from "fs"
import path from "path"

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

router.get("/", authMiddleware, (req: any, res: any) => {
    const pods = readDb("pods.json")
    let userPods = pods.filter((p: any) => p.userId === req.user.id)

    // Calculate files count for each pod
    userPods = userPods.map((pod: any) => {
        const workspacePath = path.join(__dirname, "../../../data/workspaces", pod.podId)
        let filesCount = 0

        const countFiles = (dir: string) => {
            if (!fs.existsSync(dir)) return
            const files = fs.readdirSync(dir)
            for (const file of files) {
                const fullPath = path.join(dir, file)
                if (fs.statSync(fullPath).isDirectory()) {
                    countFiles(fullPath)
                } else {
                    filesCount++
                }
            }
        }

        try {
            countFiles(workspacePath)
        } catch (e) {
            console.error(`Failed to count files for pod ${pod.podId}`, e)
        }

        return { ...pod, filesCount }
    })

    res.json(userPods)
})

router.post("/save", authMiddleware, (req: any, res: any) => {
    const { podId, name } = req.body
    if (!podId) return res.status(400).json({ error: "Pod ID is required" })

    const pods = readDb("pods.json")
    // Check if pod already exists for this user
    const existingPod = pods.find((p: any) => p.podId === podId && p.userId === req.user.id)

    if (existingPod) {
        existingPod.name = name || existingPod.name
        existingPod.updatedAt = new Date().toISOString()
    } else {
        pods.push({
            id: Date.now().toString(),
            userId: req.user.id,
            podId,
            name: name || `Pod ${podId.substring(0, 5)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })
    }

    writeDb("pods.json", pods)
    res.json({ message: "Pod saved successfully" })
})

router.delete("/:podId", authMiddleware, (req: any, res: any) => {
    const { podId } = req.params
    const pods = readDb("pods.json")
    const existingPodIndex = pods.findIndex((p: any) => p.podId === podId && p.userId === req.user.id)

    if (existingPodIndex === -1) {
        return res.status(404).json({ error: "Pod not found" })
    }

    pods.splice(existingPodIndex, 1)
    writeDb("pods.json", pods)
    res.json({ message: "Pod deleted successfully" })
})

export default router
