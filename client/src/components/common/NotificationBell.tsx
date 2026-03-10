import { useState, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineChevronRight,
} from "react-icons/hi"
import { RiCodeBoxLine } from "react-icons/ri"
import { MdOutlineAccessTime } from "react-icons/md"

interface Notification {
    id: string
    type: string
    status: "pending" | "accepted"
    fromName: string
    fromEmpId?: string
    podId: string
    podName: string
    message: string
    createdAt: string
}

interface Props {
    token: string | null
}

const BACKEND = () =>
    import.meta.env.MODE === "development"
        ? window.location.origin
        : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

const timeAgo = (date: string) => {
    const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (secs < 60) return "just now"
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
    return `${Math.floor(secs / 86400)}d ago`
}

const NotificationBell = ({ token }: Props) => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [accepting, setAccepting] = useState<string | null>(null)
    const drawerRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter((n) => n.status === "pending").length

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    useEffect(() => {
        if (!token) return
        fetchNotifications()
        // Poll every 30s for real-time feel
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [token])

    const fetchNotifications = async () => {
        if (!token) return
        setLoading(true)
        try {
            const res = await fetch(`${BACKEND()}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.sort((a: Notification, b: Notification) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ))
            }
        } catch {
            /* silent */
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (notif: Notification) => {
        setAccepting(notif.id)
        try {
            const res = await fetch(`${BACKEND()}/api/notifications/${notif.id}/accept`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(`Joined pod! Opening now…`)
                setNotifications((prev) =>
                    prev.map((n) => n.id === notif.id ? { ...n, status: "accepted" } : n)
                )
                setIsOpen(false)
                setTimeout(() => {
                    const username = localStorage.getItem("username") || "Guest"
                    navigate(`/editor/${data.podId}`, { state: { username } })
                }, 600)
            } else {
                toast.error(data.error || "Failed to accept invite")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setAccepting(null)
        }
    }

    const handleDismiss = async (id: string) => {
        try {
            await fetch(`${BACKEND()}/api/notifications/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            })
            setNotifications((prev) => prev.filter((n) => n.id !== id))
        } catch {
            /* silent */
        }
    }

    return (
        <div className="relative" ref={drawerRef}>
            {/* Bell button */}
            <button
                id="notification-bell-btn"
                onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications() }}
                className="relative w-9 h-9 rounded-full flex items-center justify-center border border-border hover:bg-surfaceHover transition-all"
                style={{ color: "var(--text-secondary)" }}
                title="Notifications"
            >
                <HiOutlineBell size={18} />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1"
                        style={{ background: "#f9de08" , color: "#111111" }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Drawer */}
            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 rounded-2xl border border-border shadow-2xl overflow-hidden z-50 flex flex-col"
                    style={{
                        width: "360px",
                        maxHeight: "480px",
                        background: "var(--surface)",
                        boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Drawer header */}
                    <div
                        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--border)" }}
                    >
                        <div className="flex items-center gap-2">
                            <HiOutlineBell size={16} style={{ color: "#7a6200" }} />
                            <h3 className="font-bold text-text">Notifications</h3>
                            {unreadCount > 0 && (
                                <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ background: "rgba(249,222,8,0.12)", color: "#7a6200" }}
                                >
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surfaceHover text-textSecondary hover:text-text transition-colors"
                        >
                            <HiOutlineX size={14} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-4 space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse"
                                        style={{ background: "var(--surface-hover)" }}>
                                        <div className="w-10 h-10 rounded-xl flex-shrink-0"
                                            style={{ background: "var(--border)" }} />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 rounded" style={{ background: "var(--border)", width: "70%" }} />
                                            <div className="h-2.5 rounded" style={{ background: "var(--border)", width: "50%" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                                    style={{ background: "rgba(249,222,8,0.08)" }}
                                >
                                    <HiOutlineBell size={22} style={{ color: "#7a6200" }} />
                                </div>
                                <p className="font-bold text-text mb-1">All caught up</p>
                                <p className="text-sm text-textSecondary">
                                    No notifications yet. When a teammate sends you pod access, it'll appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="rounded-xl p-3.5 transition-all"
                                        style={{
                                            background: notif.status === "pending"
                                                ? "rgba(249,222,8,0.05)"
                                                : "var(--surface-hover)",
                                            border: notif.status === "pending"
                                                ? "1px solid rgba(249,222,8,0.15)"
                                                : "1px solid transparent",
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{
                                                    background: notif.status === "pending"
                                                        ? "rgba(249,222,8,0.12)"
                                                        : "rgba(15,157,88,0.12)",
                                                }}
                                            >
                                                {notif.status === "accepted"
                                                    ? <HiOutlineCheck size={16} style={{ color: "#0f9d58" }} />
                                                    : <RiCodeBoxLine size={16} style={{ color: "#7a6200" }} />
                                                }
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-text leading-snug">
                                                    {notif.status === "accepted"
                                                        ? `You joined "${notif.podName}"`
                                                        : `Pod access from ${notif.fromName}`
                                                    }
                                                </p>
                                                {notif.fromEmpId && (
                                                    <span
                                                        className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5"
                                                        style={{ background: "rgba(249,222,8,0.08)", color: "#7a6200" }}
                                                    >
                                                        {notif.fromEmpId}
                                                    </span>
                                                )}
                                                <p className="text-xs text-textSecondary mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-textSecondary">
                                                    <MdOutlineAccessTime size={11} />
                                                    <span>{timeAgo(notif.createdAt)}</span>
                                                </div>

                                                {/* Actions */}
                                                {notif.status === "pending" && (
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <button
                                                            onClick={() => handleAccept(notif)}
                                                            disabled={accepting === notif.id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                                                            style={{
                                                                background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                                                                boxShadow: "0 2px 6px rgba(249,222,8,0.3)",
    color: "#111111"
    }}
                                                        >
                                                            {accepting === notif.id ? (
                                                                <>
                                                                    <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
                                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15.7" />
                                                                    </svg>
                                                                    Joining…
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <HiOutlineCheck size={12} />
                                                                    Accept & Join Pod
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDismiss(notif.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border text-textSecondary hover:text-danger hover:border-danger/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                                        >
                                                            <HiOutlineX size={11} />
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                )}

                                                {notif.status === "accepted" && (
                                                    <button
                                                        onClick={() => {
                                                            setIsOpen(false)
                                                            const username = localStorage.getItem("username") || "Guest"
                                                            navigate(`/editor/${notif.podId}`, { state: { username } })
                                                        }}
                                                        className="flex items-center gap-1 mt-2 text-xs font-semibold transition-colors hover:underline"
                                                        style={{ color: "#7a6200" }}
                                                    >
                                                        Open pod <HiOutlineChevronRight size={11} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Drawer footer */}
                    {notifications.length > 0 && (
                        <div
                            className="px-4 py-3 flex-shrink-0 flex justify-end"
                            style={{ borderTop: "1px solid var(--border)", background: "var(--surface-hover)" }}
                        >
                            <button
                                onClick={() => {
                                    // Dismiss all accepted ones
                                    notifications
                                        .filter((n) => n.status === "accepted")
                                        .forEach((n) => handleDismiss(n.id))
                                }}
                                className="text-[11px] font-semibold text-textSecondary hover:text-text transition-colors"
                            >
                                Clear accepted
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NotificationBell
