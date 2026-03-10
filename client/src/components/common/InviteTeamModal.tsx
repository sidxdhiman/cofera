import { useEffect, useState } from "react"
import { useAppContext } from "@/context/AppContext"
import { toast } from "react-hot-toast"
import {
    HiOutlineSearch,
    HiOutlineUserAdd,
    HiOutlineCheckCircle,
    HiOutlineX,
    HiOutlineOfficeBuilding,
    HiOutlineMail,
    HiOutlineIdentification,
} from "react-icons/hi"
import { RiCodeBoxLine, RiSendPlaneLine } from "react-icons/ri"

interface TeamMember {
    id: string
    username: string
    name?: string
    email?: string
    empId?: string
    project?: string
    manager?: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
}

const BACKEND = () =>
    import.meta.env.MODE === "development"
        ? window.location.origin
        : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

const stringToColor = (str: string) => {
    const palette = [
        "#f9de08", "#0f9d58", "#f9ab00", "#e37400",
        "#a142f4", "#24c1e0", "#f6397d", "#00786a",
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
}

const MemberAvatar = ({ name, size = 40 }: { name: string; size?: number }) => {
    const color = stringToColor(name)
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    return (
        <div style={{
            width: size, height: size, background: color,
            borderRadius: "10px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: size * 0.35, fontWeight: 700,
            color: "white", flexShrink: 0,
        }}>
            {initials}
        </div>
    )
}

const InviteTeamModal = ({ isOpen, onClose }: Props) => {
    const { currentUser } = useAppContext()
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [sending, setSending] = useState<string | null>(null)
    const [sent, setSent] = useState<Set<string>>(new Set())
    const [myProfile, setMyProfile] = useState<TeamMember | null>(null)

    useEffect(() => {
        if (!isOpen) return
        const profile = localStorage.getItem("userProfile")
        if (profile) setMyProfile(JSON.parse(profile))
        fetchTeamMembers()
    }, [isOpen])

    const fetchTeamMembers = async () => {
        const token = localStorage.getItem("token")
        if (!token) return
        setLoading(true)
        try {
            const res = await fetch(`${BACKEND()}/api/notifications/team-members`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setTeamMembers(data)
            } else if (res.status === 401) {
                toast.error("Please log in to invite teammates")
            }
        } catch {
            toast.error("Could not load team members")
        } finally {
            setLoading(false)
        }
    }

    const handleSendInvite = async (member: TeamMember) => {
        if (sent.has(member.id)) {
            toast("Invite already sent to this teammate", { icon: "ℹ️" })
            return
        }
        const token = localStorage.getItem("token")
        if (!token) {
            toast.error("You must be logged in to send invites")
            return
        }
        if (!currentUser.roomId) {
            toast.error("No active pod to share")
            return
        }

        // Check if they already have this pod
        setSending(member.id)
        try {
            const res = await fetch(`${BACKEND()}/api/notifications/send-invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    toUserId: member.id,
                    podId: currentUser.roomId,
                    podName: `Pod by ${myProfile?.name || localStorage.getItem("username")}`,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setSent((prev) => new Set([...prev, member.id]))
                toast.success(`Access credentials sent to ${member.name || member.username} ✓`)
            } else if (res.status === 409) {
                toast("Invite already pending for this employee", { icon: "⚠️" })
                setSent((prev) => new Set([...prev, member.id]))
            } else {
                toast.error(data.error || "Failed to send invite")
            }
        } catch {
            toast.error("Network error")
        } finally {
            setSending(null)
        }
    }

    const filtered = teamMembers.filter((m) => {
        const q = search.toLowerCase()
        return (
            m.name?.toLowerCase().includes(q) ||
            m.username.toLowerCase().includes(q) ||
            m.empId?.toLowerCase().includes(q) ||
            m.email?.toLowerCase().includes(q)
        )
    })

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    maxHeight: "85vh",
                }}
            >
                {/* Header */}
                <div
                    className="px-6 pt-6 pb-5 flex-shrink-0"
                    style={{
                        background: "linear-gradient(135deg, #c4a800 0%, #f9de08 100%)",
    color: "#111111"
    }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                <HiOutlineUserAdd size={20} color="white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">Add Project Member</h2>
                                <p className="text-blue-200 text-xs mt-0.5">
                                    Send pod access to teammates on your project
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 transition-all ml-4 flex-shrink-0"
                        >
                            <HiOutlineX size={16} />
                        </button>
                    </div>

                    {/* Active pod pill */}
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                        <RiCodeBoxLine size={14} color="white" />
                        <span className="text-white">Active Pod:</span>
                        <span className="text-blue-200 font-mono">
                            {currentUser.roomId?.slice(0, 8)}…{currentUser.roomId?.slice(-4)}
                        </span>
                    </div>

                    {/* Project context */}
                    {myProfile?.project && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-200">
                            <HiOutlineOfficeBuilding size={12} />
                            <span>Showing teammates from: <strong className="text-white">{myProfile.project}</strong></span>
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="px-5 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="relative">
                        <HiOutlineSearch
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "var(--text-secondary)" }}
                        />
                        <input
                            type="text"
                            placeholder="Search by name, Employee ID, or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            style={{
                                background: "var(--surface-hover)",
                                color: "var(--text)",
                            }}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Member list */}
                <div className="flex-1 overflow-y-auto">
                    {!localStorage.getItem("token") ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
                                <HiOutlineIdentification size={24} style={{ color: "#f9ab00" }} />
                            </div>
                            <p className="font-bold text-text mb-1">Sign in required</p>
                            <p className="text-sm text-textSecondary">
                                Log in with your @carehealth.com account to invite project teammates.
                            </p>
                        </div>
                    ) : !myProfile?.project ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                                style={{ background: "rgba(249,222,8,0.1)" }}>
                                <HiOutlineOfficeBuilding size={24} style={{ color: "#7a6200" }} />
                            </div>
                            <p className="font-bold text-text mb-1">No project assigned</p>
                            <p className="text-sm text-textSecondary">
                                Your account doesn't have a project set. Add one in your profile to see teammates.
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                                    style={{ background: "var(--surface-hover)" }}>
                                    <div className="w-10 h-10 rounded-xl" style={{ background: "var(--border)" }} />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 rounded" style={{ background: "var(--border)", width: "60%" }} />
                                        <div className="h-2.5 rounded" style={{ background: "var(--border)", width: "40%" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                                style={{ background: "rgba(249,222,8,0.08)" }}>
                                <HiOutlineSearch size={22} style={{ color: "#7a6200" }} />
                            </div>
                            <p className="font-bold text-text mb-1">
                                {search ? `No results for "${search}"` : "No teammates found"}
                            </p>
                            <p className="text-sm text-textSecondary">
                                {search
                                    ? "Try a different search term"
                                    : `No other employees are registered under "${myProfile?.project}"`}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-3"
                                style={{ color: "var(--text-secondary)" }}>
                                {filtered.length} teammate{filtered.length !== 1 ? "s" : ""} on {myProfile?.project}
                            </p>
                            {filtered.map((member) => {
                                const isSent = sent.has(member.id)
                                const isSending = sending === member.id
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                                        style={{
                                            background: isSent ? "rgba(15,157,88,0.04)" : "var(--surface-hover)",
                                            borderColor: isSent ? "rgba(15,157,88,0.25)" : "var(--border)",
                                        }}
                                    >
                                        <MemberAvatar name={member.name || member.username} />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-text truncate">
                                                    {member.name || member.username}
                                                </p>
                                                {member.empId && (
                                                    <span
                                                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
                                                        style={{
                                                            background: "rgba(249,222,8,0.1)",
                                                            color: "#7a6200",
                                                        }}
                                                    >
                                                        {member.empId}
                                                    </span>
                                                )}
                                            </div>
                                            {member.email && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <HiOutlineMail size={11} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                                                    <p className="text-xs text-textSecondary truncate">{member.email}</p>
                                                </div>
                                            )}
                                            {member.manager && (
                                                <p className="text-[11px] text-textSecondary mt-0.5">
                                                    Reports to: <span className="font-medium">{member.manager}</span>
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => isSent
                                                ? toast("Access already granted to this employee", { icon: "✅" })
                                                : handleSendInvite(member)
                                            }
                                            disabled={isSending}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 disabled:opacity-60"
                                            style={
                                                isSent
                                                    ? { background: "rgba(15,157,88,0.12)", color: "#0f9d58" }
                                                    : {
                                                        background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                                                        color: "white",
                                                        boxShadow: "0 2px 8px rgba(249,222,8,0.3)",
                                                    }
                                            }
                                        >
                                            {isSending ? (
                                                <>
                                                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="15.7" />
                                                    </svg>
                                                    Sending…
                                                </>
                                            ) : isSent ? (
                                                <>
                                                    <HiOutlineCheckCircle size={14} />
                                                    Sent
                                                </>
                                            ) : (
                                                <>
                                                    <RiSendPlaneLine size={13} />
                                                    Send Access
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-5 py-3.5 flex-shrink-0 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--border)", background: "var(--surface-hover)" }}
                >
                    <p className="text-[11px] text-textSecondary">
                        Recipients will receive a pod access notification on their Launchpad
                    </p>
                    <button
                        onClick={onClose}
                        className="text-xs font-semibold text-textSecondary hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surfaceHover"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InviteTeamModal
