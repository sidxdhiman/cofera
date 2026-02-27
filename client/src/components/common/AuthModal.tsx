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
    const [isLoading, setIsLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!username || !password) {
            toast.error("Please fill in all fields")
            return
        }

        setIsLoading(true)
        try {
            const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup"
            const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
            const url = `${baseUrl}${endpoint}`

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Authentication failed")
            }

            // Save token
            localStorage.setItem("token", data.token)
            localStorage.setItem("username", data.username)
            toast.success(mode === "login" ? "Logged in successfully!" : "Signed up successfully!")

            if (onSuccess) onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
            <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl bg-surface p-8 shadow-google dark:shadow-none transition-all">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text">
                        {mode === "login" ? "Log In" : "Sign Up"}
                    </h2>
                    <button onClick={onClose} className="text-textSecondary hover:text-text">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 w-full rounded-lg bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-8 py-3 text-lg font-semibold text-white disabled:opacity-50"
                    >
                        {isLoading ? "Please wait..." : (mode === "login" ? "Log In" : "Sign Up")}
                    </button>
                </form>

                <div className="flex items-center justify-center gap-1 text-sm text-textSecondary">
                    <span>{mode === "login" ? "Don't have an account?" : "Already have an account?"}</span>
                    <button
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                        className="text-primary hover:underline"
                    >
                        {mode === "login" ? "Sign Up" : "Log In"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AuthModal
