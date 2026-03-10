import express from "express"
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
    } catch {
        res.status(401).json({ error: "Invalid token" })
    }
}

// GET /api/notifications — get all notifications for the current user
router.get("/", authMiddleware, (req: any, res: any) => {
    const all = readDb("notifications.json")
    const mine = all.filter((n: any) => n.toUserId === req.user.id)
    res.json(mine)
})

// DELETE /api/notifications/:id — dismiss a notification
router.delete("/:id", authMiddleware, (req: any, res: any) => {
    const all = readDb("notifications.json")
    const idx = all.findIndex((n: any) => n.id === req.params.id && n.toUserId === req.user.id)
    if (idx === -1) return res.status(404).json({ error: "Not found" })
    all.splice(idx, 1)
    writeDb("notifications.json", all)
    res.json({ message: "Dismissed" })
})

// POST /api/notifications/send-invite — send a pod access invite to a teammate
router.post("/send-invite", authMiddleware, (req: any, res: any) => {
    const { toUserId, podId, podName } = req.body
    if (!toUserId || !podId) return res.status(400).json({ error: "Missing fields" })

    const users = readDb("users.json")
    const sender = users.find((u: any) => u.id === req.user.id)
    const recipient = users.find((u: any) => u.id === toUserId)
    if (!recipient) return res.status(404).json({ error: "Recipient not found" })

    // Check same project
    if (!sender?.project || sender.project !== recipient.project) {
        return res.status(403).json({ error: "You can only invite employees in the same project" })
    }

    const all = readDb("notifications.json")

    // Prevent duplicate pending invite
    const alreadySent = all.find(
        (n: any) =>
            n.toUserId === toUserId &&
            n.podId === podId &&
            n.type === "pod_invite" &&
            n.status === "pending"
    )
    if (alreadySent) {
        return res.status(409).json({ error: "Invite already sent and pending" })
    }

    const notification = {
        id: `notif_${Date.now()}`,
        type: "pod_invite",
        status: "pending",
        toUserId,
        fromUserId: req.user.id,
        fromName: sender?.name || sender?.username || "A teammate",
        fromEmpId: sender?.empId || "",
        podId,
        podName: podName || `Pod ${podId.slice(0, 6)}`,
        message: `${sender?.name || sender?.username} has shared access to the pod "${podName || podId.slice(0, 8)}"`,
        createdAt: new Date().toISOString(),
    }

    all.push(notification)
    writeDb("notifications.json", all)

    res.status(201).json({ message: "Invite sent", notification })
})

// POST /api/notifications/:id/accept — accept a pod invite
router.post("/:id/accept", authMiddleware, (req: any, res: any) => {
    const all = readDb("notifications.json")
    const notif = all.find((n: any) => n.id === req.params.id && n.toUserId === req.user.id)
    if (!notif) return res.status(404).json({ error: "Notification not found" })

    notif.status = "accepted"
    writeDb("notifications.json", all)

    // Auto-save the pod for this user
    const pods = readDb("pods.json")
    const alreadyHasPod = pods.find((p: any) => p.podId === notif.podId && p.userId === req.user.id)
    if (!alreadyHasPod) {
        pods.push({
            id: Date.now().toString(),
            userId: req.user.id,
            podId: notif.podId,
            name: notif.podName,
            createdBy: notif.fromUserId,  // original creator
            sharedFrom: notif.fromUserId, // who shared it
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        writeDb("pods.json", pods)
    }

    res.json({ message: "Accepted", podId: notif.podId })
})

// GET /api/notifications/team-members — get colleagues in the same project
router.get("/team-members", authMiddleware, (req: any, res: any) => {
    const users = readDb("users.json")
    const me = users.find((u: any) => u.id === req.user.id)
    if (!me?.project) return res.json([])

    const teammates = users
        .filter((u: any) => u.project === me.project && u.id !== me.id)
        .map(({ password: _p, ...safe }: any) => safe)

    res.json(teammates)
})

export default router
