import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { useAppContext } from "@/context/AppContext"
import { MdDelete, MdOutlineCode, MdOutlineAccessTime, MdStorage } from "react-icons/md"
import {
    HiOutlineUser,
    HiOutlineLogout,
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineChevronRight,
    HiOutlineOfficeBuilding,
    HiOutlineMail,
    HiOutlineIdentification,
    HiOutlineUserGroup,
    HiOutlineBriefcase,
} from "react-icons/hi"
import { RiCodeBoxLine, RiTerminalBoxLine } from "react-icons/ri"
import NotificationBell from "@/components/common/NotificationBell"

interface Pod {
    id: string
    podId: string
    name: string
    updatedAt: string
    createdAt?: string
    filesCount?: number
}

interface UserProfile {
    id: string
    username: string
    email?: string
    name?: string
    empId?: string
    manager?: string
    project?: string
    createdAt?: string
}

const BACKEND = () =>
    import.meta.env.MODE === "development"
        ? window.location.origin
        : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

// Deterministic color from string
const stringToColor = (str: string) => {
    const palette = [
        "#f9de08", "#0f9d58", "#f9ab00", "#e37400",
        "#a142f4", "#24c1e0", "#f6397d", "#00786a"
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
}

const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
    const color = stringToColor(name)
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    return (
        <div
            style={{
                width: size,
                height: size,
                background: color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.36,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
                letterSpacing: "-0.5px"
            }}
        >
            {initials}
        </div>
    )
}

const MetricBadge = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) => (
    <div className="flex items-center gap-1.5 text-xs text-textSecondary">
        <span className="text-primary opacity-70">{icon}</span>
        <span className="font-medium text-text">{value}</span>
        <span>{label}</span>
    </div>
)

function LaunchPadPage() {
    const navigate = useNavigate()
    const { setCurrentUser } = useAppContext()
    const [pods, setPods] = useState<Pod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [podToDelete, setPodToDelete] = useState<Pod | null>(null)
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [newPodName, setNewPodName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)
    const token = localStorage.getItem("token")

    const now = new Date()
    const hour = now.getHours()
    const greeting =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

    useEffect(() => {
        // Close profile menu on outside click
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/")
            return
        }

        // Load profile from localStorage first (optimistic)
        const cached = localStorage.getItem("userProfile")
        if (cached) {
            try {
                setUserProfile(JSON.parse(cached))
            } catch (_) { }
        }

        // Fetch fresh profile from server
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${BACKEND()}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setUserProfile(data)
                    localStorage.setItem("userProfile", JSON.stringify(data))
                }
            } catch (_) { }
        }

        fetchProfile()
        fetchPods(token)
    }, [navigate])

    const fetchPods = async (token?: string) => {
        const t = token || localStorage.getItem("token")
        if (!t) return
        try {
            const response = await fetch(`${BACKEND()}/api/pods`, {
                headers: { Authorization: `Bearer ${t}` }
            })
            if (response.ok) {
                const data = await response.json()
                setPods(data)
            } else if (response.status === 401) {
                localStorage.removeItem("token")
                localStorage.removeItem("username")
                navigate("/")
            } else {
                toast.error("Failed to load pods")
            }
        } catch {
            toast.error("Error connecting to server")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateNewPod = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPodName.trim()) return
        setIsCreating(true)
        const username = localStorage.getItem("username") || "Guest"
        const podId = uuidv4()
        const token = localStorage.getItem("token")
        if (token) {
            try {
                await fetch(`${BACKEND()}/api/pods/save`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ podId, name: newPodName.trim() })
                })
            } catch (error) {
                console.error("Failed to save pod name", error)
            }
        }
        setCurrentUser({ username, roomId: podId })
        navigate(`/editor/${podId}`, { state: { username } })
    }

    const handleJoinPod = (podId: string) => {
        const username = localStorage.getItem("username") || "Guest"
        setCurrentUser({ username, roomId: podId })
        navigate(`/editor/${podId}`, { state: { username } })
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("username")
        localStorage.removeItem("userProfile")
        navigate("/")
        toast.success("Signed out successfully")
    }

    const handleDeletePod = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!podToDelete) return
        if (deleteConfirmationText !== podToDelete.name) {
            toast.error("Pod name does not match")
            return
        }
        setIsDeleting(true)
        const token = localStorage.getItem("token")
        try {
            const response = await fetch(`${BACKEND()}/api/pods/${podToDelete.podId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                toast.success("Pod deleted")
                setPodToDelete(null)
                setDeleteConfirmationText("")
                fetchPods()
            } else {
                toast.error("Failed to delete pod")
            }
        } catch {
            toast.error("Error connecting to server")
        } finally {
            setIsDeleting(false)
        }
    }

    const getFakeResources = (podId: string, realFilesCount?: number) => {
        const num = podId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
        let filesCount = (num % 150) + 5
        let memory = ((filesCount * 18.5) / 1024).toFixed(2)
        let cpu = ((num % 45) + 0.5).toFixed(1)
        if (realFilesCount !== undefined) {
            filesCount = realFilesCount
            memory = ((filesCount * 4.5 + 50) / 1024).toFixed(3)
            cpu = (((num % 25) + 1.0) * (filesCount > 0 ? 1 : 0)).toFixed(1)
        }
        return { filesCount, memory, cpu }
    }

    const filteredPods = pods.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const displayName = userProfile?.name || localStorage.getItem("username") || "User"
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    const avatarColor = stringToColor(displayName)

    const totalFiles = pods.reduce((acc, p) => acc + (p.filesCount || 0), 0)
    const lastActive = pods.length > 0
        ? new Date(Math.max(...pods.map((p) => new Date(p.updatedAt).getTime())))
        : null

    return (
        <div
            className="min-h-screen"
            style={{ background: "var(--background)" }}
        >
            {/* ── TOP NAV ── */}
            <header
                className="sticky top-0 z-50 border-b border-border"
                style={{
                    background: "var(--surface)",
                    backdropFilter: "blur(12px)"
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)", color: "#111111" }}
                        >
                            <RiCodeBoxLine size={18} color="#111111" />
                        </div>
                        <span
                            className="text-xl font-black tracking-tight"
                            style={{ color: "var(--text)" }}
                        >
                            Cofera
                        </span>
                        <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full ml-1"
                            style={{
                                background: "rgba(249,222,8,0.12)",
                                color: "#7a6200"
                            }}
                        >
                            Enterprise
                        </span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* ── NOTIFICATION BELL ── */}
                        <NotificationBell token={token} />

                        {/* Profile dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                id="profile-menu-btn"
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 border border-border hover:bg-surfaceHover transition-all"
                            >
                                <Avatar name={displayName} size={32} />
                                <div className="text-left hidden sm:block">
                                    <p
                                        className="text-sm font-semibold leading-tight"
                                        style={{ color: "var(--text)" }}
                                    >
                                        {displayName}
                                    </p>
                                    <p
                                        className="text-xs leading-tight"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        {userProfile?.empId || "Employee"}
                                    </p>
                                </div>
                                <HiOutlineChevronRight
                                    size={14}
                                    style={{
                                        color: "var(--text-secondary)",
                                        transform: profileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                                        transition: "transform 0.2s"
                                    }}
                                />
                            </button>

                            {profileMenuOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border shadow-lg overflow-hidden z-50"
                                    style={{ background: "var(--surface)" }}
                                >
                                    <div
                                        className="px-4 py-3 border-b border-border"
                                        style={{ background: "var(--surface-hover)" }}
                                    >
                                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                                            Signed in as
                                        </p>
                                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                                            {userProfile?.email || localStorage.getItem("username")}
                                        </p>
                                    </div>
                                    <div className="p-1.5">
                                        <button
                                            id="view-profile-btn"
                                            onClick={() => { setIsProfileOpen(true); setProfileMenuOpen(false) }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-surfaceHover transition-colors text-left"
                                            style={{ color: "var(--text)" }}
                                        >
                                            <HiOutlineUser size={16} style={{ color: "var(--text-secondary)" }} />
                                            View Profile
                                        </button>
                                        <button
                                            id="signout-btn"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                            style={{ color: "var(--danger)" }}
                                        >
                                            <HiOutlineLogout size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── HERO BANNER ── */}
            <div
                className="w-full py-12 px-6"
                style={{
                    background: "linear-gradient(135deg, #c4a800 0%, #f9de08 100%)",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Background decoration */}
                <div style={{
                    position: "absolute", inset: 0, opacity: 0.07,
                    backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                      radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
                    backgroundSize: "60px 60px"
                }} />
                <div
                    style={{
                        position: "absolute", right: -80, top: -80,
                        width: 350, height: 350,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)"
                    }}
                />
                <div
                    style={{
                        position: "absolute", right: 60, bottom: -120,
                        width: 250, height: 250,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.04)"
                    }}
                />

                <div className="max-w-7xl mx-auto relative">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <p className="text-gray-800 text-sm font-medium mb-1">
                                {greeting}, {displayName.split(" ")[0]} 👋
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                Your Development Hub
                            </h1>
                            <p className="text-gray-800 mt-2 max-w-lg">
                                Manage your collaborative coding pods, share workspaces, and build faster — all from one place.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { label: "Total Pods", value: pods.length, icon: <RiCodeBoxLine size={18} /> },
                                { label: "Workspace Files", value: totalFiles, icon: <MdStorage size={18} /> },
                                {
                                    label: "Last Active",
                                    value: lastActive ? lastActive.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
                                    icon: <MdOutlineAccessTime size={18} />
                                }
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex flex-col items-center justify-center px-5 py-4 rounded-2xl min-w-[100px]"
                                    style={{ background: "rgba(0,0,0,0.08)", backdropFilter: "blur(8px)" }}
                                >
                                    <div className="text-gray-800 mb-1">{stat.icon}</div>
                                    <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                                    <div className="text-[11px] text-gray-800 font-medium mt-0.5 whitespace-nowrap">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {[
                        {
                            title: "New Coding Pod",
                            desc: "Start a fresh collaborative workspace",
                            icon: <HiOutlinePlus size={22} />,
                            color: "#7a6200",
                            bg: "linear-gradient(135deg, #f9de08, #e8ce00)",
                            action: () => setIsCreateModalOpen(true),
                            id: "quick-new-pod"
                        },
                        {
                            title: "Live Terminal",
                            desc: "Full-featured terminal in every pod",
                            icon: <RiTerminalBoxLine size={22} />,
                            color: "#0f9d58",
                            bg: "linear-gradient(135deg, #0f9d58, #34a853)",
                            action: () => pods.length > 0 ? handleJoinPod(pods[0].podId) : setIsCreateModalOpen(true),
                            id: "quick-terminal"
                        },
                        {
                            title: "My Profile",
                            desc: "View your employee details",
                            icon: <HiOutlineIdentification size={22} />,
                            color: "#a142f4",
                            bg: "linear-gradient(135deg, #a142f4, #7c3aed)",
                            action: () => setIsProfileOpen(true),
                            id: "quick-profile"
                        }
                    ].map((card) => (
                        <button
                            key={card.title}
                            id={card.id}
                            onClick={card.action}
                            className="flex items-center gap-4 p-5 rounded-2xl border border-border text-left hover:-translate-y-0.5 transition-all hover:shadow-google-hover"
                            style={{ background: "var(--surface)" }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: card.bg }}
                            >
                                <span className="text-white">{card.icon}</span>
                            </div>
                            <div>
                                <p className="font-bold text-text">{card.title}</p>
                                <p className="text-sm text-textSecondary">{card.desc}</p>
                            </div>
                            <HiOutlineChevronRight
                                size={16}
                                className="ml-auto flex-shrink-0"
                                style={{ color: "var(--text-secondary)" }}
                            />
                        </button>
                    ))}
                </div>

                {/* Pods Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-text">Your Pods</h2>
                            <p className="text-sm text-textSecondary mt-0.5">
                                {pods.length} workspace{pods.length !== 1 ? "s" : ""} • Click any pod to jump in
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <HiOutlineSearch
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--text-secondary)" }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search pods..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    style={{
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        width: "200px"
                                    }}
                                />
                            </div>
                            <button
                                id="create-pod-btn"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                                style={{
                                    background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                                    boxShadow: "0 2px 8px rgba(249,222,8,0.35)",
                                    color: "#111111"
                                }}
                            >
                                <HiOutlinePlus size={16} />
                                New Pod
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-border p-6 animate-pulse"
                                    style={{ background: "var(--surface)", height: 200 }}
                                />
                            ))}
                        </div>
                    ) : filteredPods.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPods.map((pod) => {
                                const resources = getFakeResources(pod.podId, pod.filesCount)
                                const podColor = stringToColor(pod.name)
                                const updatedDate = new Date(pod.updatedAt)
                                const daysAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24))
                                const timeLabel =
                                    daysAgo === 0
                                        ? "Today"
                                        : daysAgo === 1
                                            ? "Yesterday"
                                            : `${daysAgo}d ago`

                                return (
                                    <div
                                        key={pod.id}
                                        className="group rounded-2xl border border-border overflow-hidden hover:-translate-y-1 hover:shadow-google-hover transition-all cursor-pointer flex flex-col"
                                        style={{ background: "var(--surface)" }}
                                        onClick={() => handleJoinPod(pod.podId)}
                                    >
                                        {/* Color strip + header */}
                                        <div
                                            className="h-1.5 w-full"
                                            style={{ background: podColor }}
                                        />
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ background: podColor + "20" }}
                                                >
                                                    <MdOutlineCode size={20} style={{ color: podColor }} />
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setPodToDelete(pod)
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full text-textSecondary hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                >
                                                    <MdDelete size={16} />
                                                </button>
                                            </div>

                                            <h3
                                                className="text-base font-bold text-text mb-1 group-hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {pod.name}
                                            </h3>
                                            <p
                                                className="text-xs font-mono mb-4"
                                                style={{ color: "var(--text-secondary)" }}
                                            >
                                                {pod.podId.slice(0, 8)}…{pod.podId.slice(-4)}
                                            </p>

                                            {/* Resource pills */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <MetricBadge
                                                    icon={<MdStorage size={12} />}
                                                    label="GB"
                                                    value={resources.memory}
                                                />
                                                <MetricBadge
                                                    icon={<RiTerminalBoxLine size={12} />}
                                                    label="CPU%"
                                                    value={resources.cpu}
                                                />
                                                <MetricBadge
                                                    icon={<MdOutlineCode size={12} />}
                                                    label="files"
                                                    value={resources.filesCount.toString()}
                                                />
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                                                <div className="flex items-center gap-1.5 text-xs text-textSecondary">
                                                    <MdOutlineAccessTime size={12} />
                                                    <span>{timeLabel}</span>
                                                </div>
                                                <span
                                                    className="text-xs font-semibold px-3 py-1 rounded-lg text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    style={{ background: podColor }}
                                                >
                                                    Open <HiOutlineChevronRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : pods.length === 0 ? (
                        /* Empty state */
                        <div
                            className="rounded-2xl border border-dashed border-border flex flex-col items-center justify-center py-20 px-8 text-center"
                            style={{ background: "var(--surface)" }}
                        >
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                                style={{ background: "rgba(249,222,8,0.08)" }}
                            >
                                <RiCodeBoxLine size={36} style={{ color: "#7a6200" }} />
                            </div>
                            <h3 className="text-lg font-bold text-text mb-2">No pods yet</h3>
                            <p className="text-textSecondary max-w-sm mb-6">
                                Create your first pod to start a collaborative coding session. Invite teammates and code together in real-time.
                            </p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-gray-900 transition-all hover:opacity-90"
                                style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)" }}
                            >
                                <HiOutlinePlus size={16} />
                                Create your first Pod
                            </button>
                        </div>
                    ) : (
                        /* No search results */
                        <div className="text-center py-16 text-textSecondary">
                            <p className="text-lg font-semibold text-text mb-1">No pods match "{searchQuery}"</p>
                            <p>Try a different search term</p>
                        </div>
                    )}
                </div>

                {/* About / Info strip */}
                <div
                    className="mt-12 rounded-2xl border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6"
                    style={{ background: "var(--surface)" }}
                >
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(249,222,8,0.1)" }}
                    >
                        <HiOutlineOfficeBuilding size={22} style={{ color: "#7a6200" }} />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-text">CareHealth Engineering Platform</p>
                        <p className="text-sm text-textSecondary mt-0.5">
                            Cofera is the official collaborative development environment for CareHealth employees. Your pods are private and secured with JWT authentication. All IDE sessions are end-to-end encrypted.
                        </p>
                    </div>
                    <div
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
                        style={{ background: "rgba(15,157,88,0.1)", color: "#0f9d58" }}
                    >
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        All systems operational
                    </div>
                </div>
            </div>

            {/* ── PROFILE MODAL ── */}
            {isProfileOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    onClick={(e) => e.target === e.currentTarget && setIsProfileOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        {/* Profile header */}
                        <div
                            className="relative px-8 pt-10 pb-16"
                            style={{
                                background: "linear-gradient(135deg, #c4a800 0%, #f9de08 100%)"
                            }}
                        >
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="absolute top-4 right-4 text-black/60 hover:text-black w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-all"
                            >
                                ✕
                            </button>
                            <p className="text-gray-800 text-xs font-semibold uppercase tracking-widest mb-1">
                                Employee Profile
                            </p>
                            <h2 className="text-2xl font-black text-gray-900">
                                {userProfile?.name || displayName}
                            </h2>
                            <p className="text-gray-800 text-sm mt-0.5">
                                {userProfile?.project || "CareHealth Team"}
                            </p>

                            {/* Floating avatar */}
                            <div
                                className="absolute -bottom-10 left-8 rounded-2xl border-4"
                                style={{ borderColor: "var(--surface)" }}
                            >
                                <div
                                    style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 14,
                                        background: avatarColor,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: "white"
                                    }}
                                >
                                    {initials}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="px-8 pt-14 pb-6">
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    {
                                        icon: <HiOutlineIdentification size={16} />,
                                        label: "Employee ID",
                                        value: userProfile?.empId || "—",
                                        color: "#7a6200"
                                    },
                                    {
                                        icon: <HiOutlineUser size={16} />,
                                        label: "Full Name",
                                        value: userProfile?.name || displayName,
                                        color: "#0f9d58"
                                    },
                                    {
                                        icon: <HiOutlineMail size={16} />,
                                        label: "Work Email",
                                        value: userProfile?.email || "—",
                                        color: "#e37400"
                                    },
                                    {
                                        icon: <HiOutlineUserGroup size={16} />,
                                        label: "Manager",
                                        value: userProfile?.manager || "—",
                                        color: "#a142f4"
                                    },
                                    {
                                        icon: <HiOutlineBriefcase size={16} />,
                                        label: "Project",
                                        value: userProfile?.project || "—",
                                        color: "#f6397d"
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-4 p-3.5 rounded-xl"
                                        style={{ background: "var(--surface-hover)" }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: item.color + "18", color: item.color }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary">
                                                {item.label}
                                            </p>
                                            <p className="text-sm font-semibold text-text truncate">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {userProfile?.createdAt && (
                                <p className="text-xs text-textSecondary text-center mt-4">
                                    Member since{" "}
                                    {new Date(userProfile.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        year: "numeric"
                                    })}
                                </p>
                            )}

                            <button
                                onClick={handleLogout}
                                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/40 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                                style={{ color: "var(--danger)" }}
                            >
                                <HiOutlineLogout size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CREATE POD MODAL ── */}
            {isCreateModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                    onClick={(e) => e.target === e.currentTarget && setIsCreateModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                        <div
                            className="px-8 pt-7 pb-5"
                            style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)" }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                                <RiCodeBoxLine size={20} color="white" />
                            </div>
                            <h2 className="text-xl font-black text-white">Create New Pod</h2>
                            <p className="text-blue-200 text-sm mt-1">Give your coding workspace a descriptive name</p>
                        </div>

                        <form onSubmit={handleCreateNewPod} className="px-8 py-6 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block mb-1.5">
                                    Pod Name *
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Patient Dashboard API, Auth Service..."
                                    value={newPodName}
                                    onChange={(e) => setNewPodName(e.target.value)}
                                    className="w-full rounded-xl border border-border px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    style={{ background: "var(--surface-hover)" }}
                                />
                                <p className="text-xs text-textSecondary mt-1.5">
                                    A unique ID will be auto-generated for this pod
                                </p>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateModalOpen(false); setNewPodName("") }}
                                    className="flex-1 rounded-xl border border-border px-4 py-3 font-semibold text-text hover:bg-surfaceHover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    id="create-pod-confirm-btn"
                                    disabled={isCreating || !newPodName.trim()}
                                    className="flex-1 rounded-xl px-4 py-3 font-bold transition-all disabled:opacity-50 hover:opacity-90"
                                    style={{
                                        background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                                        boxShadow: "0 4px 12px rgba(249,222,8,0.35)",
                                        color: "#111111"
                                    }}
                                >
                                    {isCreating ? "Creating…" : "Launch Pod →"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

            {/* ── DELETE CONFIRMATION MODAL ── */}
            {
                podToDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <div
                            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                            <div className="px-8 pt-7 pb-5" style={{ background: "rgba(234,67,53,0.08)" }}>
                                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                                    <MdDelete size={20} style={{ color: "var(--danger)" }} />
                                </div>
                                <h2 className="text-xl font-black text-text">Delete Pod?</h2>
                                <p className="text-textSecondary text-sm mt-1">
                                    This action is irreversible. The pod{" "}
                                    <span className="font-bold text-text">{podToDelete.name}</span> and all its data will be permanently removed.
                                </p>
                            </div>

                            <form onSubmit={handleDeletePod} className="px-8 py-6 flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary block mb-1.5">
                                        Type <span className="text-text font-bold">{podToDelete.name}</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={podToDelete.name}
                                        value={deleteConfirmationText}
                                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                        className="w-full rounded-xl border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger transition-all"
                                        style={{ background: "var(--surface-hover)", color: "var(--text)" }}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setPodToDelete(null); setDeleteConfirmationText("") }}
                                        className="flex-1 rounded-xl border border-border px-4 py-3 font-semibold text-text hover:bg-surfaceHover transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDeleting || deleteConfirmationText !== podToDelete.name}
                                        className="flex-1 rounded-xl px-4 py-3 font-bold text-white transition-all disabled:opacity-40 hover:opacity-90"
                                        style={{ background: "var(--danger)" }}
                                    >
                                        {isDeleting ? "Deleting…" : "Delete Pod"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default LaunchPadPage
