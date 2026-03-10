import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import AuthModal from "@/components/common/AuthModal"
import { RiCodeBoxLine } from "react-icons/ri"
import { HiOutlinePlus } from "react-icons/hi"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()
    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const [authModalConfig, setAuthModalConfig] = useState<{ isOpen: boolean; mode: "login" | "signup" }>({
        isOpen: false,
        mode: "login",
    })

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Generated a new Pod ID")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a Pod ID")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("Pod ID must be at least 5 characters")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining pod…")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) navigate("/launchpad")
    }, [navigate])

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) toast.success("Enter your username")
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }
        const isRedirect = sessionStorage.getItem("redirect") || false
        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, { state: { username } })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
                background: "var(--surface)",
                border: "1px solid rgba(255,255,255,0.15)",
            }}
        >
            {/* Card header */}
            <div
                className="px-7 pt-6 pb-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
                <div className="flex items-center gap-2.5 mb-3">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)", color: "#111111" }}
                    >
                        <RiCodeBoxLine size={15} color="#111111" />
                    </div>
                    <h2 className="text-lg font-black text-text tracking-tight">Join a Pod</h2>
                </div>
                <p className="text-sm text-textSecondary">
                    Enter a Pod ID and username to start collaborating instantly.
                </p>
            </div>

            {/* Form body */}
            <div className="px-7 py-6">
                <form onSubmit={joinRoom} className="flex flex-col gap-3">
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary block mb-1.5">
                            Pod ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="roomId"
                                placeholder="Enter or paste a Pod ID"
                                className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-text"
                                style={{ background: "var(--surface-hover)" }}
                                onChange={handleInputChanges}
                                value={currentUser.roomId}
                            />
                            <button
                                type="button"
                                onClick={createNewRoomId}
                                title="Generate new Pod ID"
                                className="px-3 py-2.5 rounded-xl border border-border hover:bg-surfaceHover transition-colors text-textSecondary hover:text-text flex items-center justify-center"
                            >
                                <HiOutlinePlus size={16} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary block mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Your display name"
                            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-text"
                            style={{ background: "var(--surface-hover)" }}
                            onChange={handleInputChanges}
                            value={currentUser.username}
                            ref={usernameRef}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === USER_STATUS.ATTEMPTING_JOIN}
                        className="mt-1 w-full rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-60 hover:opacity-90"
                        style={{
                            background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                            boxShadow: "0 4px 14px rgba(249,222,8,0.4)",
                            color: "#111111"
                        }}
                    >
                        {status === USER_STATUS.ATTEMPTING_JOIN ? "Joining…" : "Join Pod →"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    <span className="text-xs text-textSecondary font-medium">or</span>
                    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>

                {/* Employee Access button */}
                <button
                    id="employee-access-btn"
                    onClick={() => setAuthModalConfig({ isOpen: true, mode: "login" })}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-border py-2.5 text-sm font-semibold text-text hover:bg-surfaceHover transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Employee Access
                </button>

                <p className="text-[11px] text-textSecondary text-center mt-3">
                    @carehealth.com accounts only
                </p>
            </div>

            <AuthModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
                initialMode={authModalConfig.mode}
                onSuccess={() => {
                    const savedUsername = localStorage.getItem("username")
                    if (savedUsername) setCurrentUser({ ...currentUser, username: savedUsername })
                    navigate("/launchpad")
                }}
            />
        </div>
    )
}

export default FormComponent
