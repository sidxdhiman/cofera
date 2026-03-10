import { useState } from "react"
import toast from "react-hot-toast"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: "login" | "signup"
    onSuccess?: () => void
}

const AuthModal = ({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) => {
    const [mode, setMode] = useState<"login" | "signup">(initialMode)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [empId, setEmpId] = useState("")
    const [manager, setManager] = useState("")
    const [project, setProject] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username || !password) {
            toast.error("Please fill in all required fields")
            return
        }

        if (mode === "signup") {
            if (!email) {
                toast.error("Email is required")
                return
            }
            if (!email.toLowerCase().endsWith("@carehealth.com")) {
                toast.error("Only @carehealth.com emails are allowed")
                return
            }
            if (!name.trim()) {
                toast.error("Full name is required")
                return
            }
        }

        setIsLoading(true)
        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
            const baseUrl = import.meta.env.MODE === "development"
                ? window.location.origin
                : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
            const url = `${baseUrl}${endpoint}`

            const body = mode === "login"
                ? { username, password }
                : { username, password, email, name, empId, manager, project }

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Authentication failed")
            }

            localStorage.setItem("token", data.token)
            localStorage.setItem("username", data.username)
            if (data.user) {
                localStorage.setItem("userProfile", JSON.stringify(data.user))
            }
            toast.success(mode === "login" ? "Welcome back!" : "Account created successfully!")

            if (onSuccess) onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const switchMode = () => {
        setMode(mode === "login" ? "signup" : "login")
        setUsername("")
        setPassword("")
        setEmail("")
        setName("")
        setEmpId("")
        setManager("")
        setProject("")
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8">
            <div
                className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-2xl transition-all"
                style={{
                    maxWidth: mode === "signup" ? "520px" : "420px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)"
                }}
            >
                {/* Header */}
                <div
                    className="px-8 pt-8 pb-6"
                    style={{
                        background: "linear-gradient(135deg, #c4a800 0%, #f9de08 100%)",
                        color: "#111111"
                    }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-white font-bold text-lg tracking-tight">Cofera</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-lg"
                        >
                            ✕
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4">
                        {mode === "login" ? "Welcome back" : "Join CareHealth"}
                    </h2>
                    <p className="text-white/70 text-sm mt-1">
                        {mode === "login"
                            ? "Sign in to your workspace"
                            : "Create your employee account"}
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 py-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {mode === "signup" && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Full Name *</label>
                                        <input
                                            type="text"
                                            placeholder="Jane Smith"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Employee ID</label>
                                        <input
                                            type="text"
                                            placeholder="EMP-001"
                                            value={empId}
                                            onChange={(e) => setEmpId(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Work Email *</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="jane.smith@carehealth.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                                        />
                                        {email && (
                                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${email.toLowerCase().endsWith("@carehealth.com") ? "text-green-500" : "text-red-400"}`}>
                                                {email.toLowerCase().endsWith("@carehealth.com") ? "✓" : "✗"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-textSecondary">Only @carehealth.com emails are accepted</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Manager</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={manager}
                                            onChange={(e) => setManager(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Project</label>
                                        <input
                                            type="text"
                                            placeholder="Health Platform"
                                            value={project}
                                            onChange={(e) => setProject(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-border pt-3 mt-1">
                                    <p className="text-[10px] text-textSecondary uppercase font-semibold tracking-wider mb-2">Account Credentials</p>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Username *</label>
                            <input
                                type="text"
                                placeholder="janesmith"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-text text-xs"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            id="auth-submit-btn"
                            disabled={isLoading}
                            className="mt-3 w-full rounded-xl px-8 py-3 text-sm font-bold text-white transition-all disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                                boxShadow: "0 4px 15px rgba(249,222,8, 0.4)",
                                color: "#111111"
                            }}
                        >
                            {isLoading ? "Please wait..." : (mode === "login" ? "Sign In" : "Create Account")}
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-1 text-sm text-textSecondary mt-4">
                        <span>{mode === "login" ? "Don't have an account?" : "Already have an account?"}</span>
                        <button
                            onClick={switchMode}
                            className="text-primary hover:underline font-medium"
                        >
                            {mode === "login" ? "Sign Up" : "Log In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
