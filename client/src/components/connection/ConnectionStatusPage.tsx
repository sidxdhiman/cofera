import { useNavigate } from "react-router-dom"
import { RiCodeBoxLine } from "react-icons/ri"
import { HiOutlineRefresh, HiOutlineHome } from "react-icons/hi"

function ConnectionStatusPage() {
    return (
        <div
            className="flex h-screen min-h-screen flex-col items-center justify-center gap-0 px-4"
            style={{ background: "var(--background)" }}
        >
            <ConnectionError />
        </div>
    )
}

const ConnectionError = () => {
    const navigate = useNavigate()

    return (
        <div
            className="flex flex-col items-center text-center max-w-md w-full rounded-2xl border border-border p-10"
            style={{ background: "var(--surface)" }}
        >
            {/* Icon */}
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(234,67,53,0.1)" }}
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ea4335"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            </div>

            {/* Brand */}
            <div className="flex items-center gap-2 mb-4">
                <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)", color: "#111111" }}
                >
                    <RiCodeBoxLine size={13} color="white" />
                </div>
                <span className="text-sm font-bold text-textSecondary">Cofera</span>
            </div>

            <h1 className="text-xl font-black text-text mb-2">Connection Lost</h1>
            <p className="text-textSecondary text-sm mb-8 leading-relaxed">
                We couldn't reach the Cofera server. This might be a temporary issue
                with your network or the server. Please try again.
            </p>

            {/* Info strip */}
            <div
                className="w-full rounded-xl px-4 py-3 mb-8 text-left"
                style={{ background: "rgba(249,222,8,0.06)", border: "1px solid rgba(249,222,8,0.15)" }}
            >
                <p className="text-xs font-semibold text-textSecondary mb-1">What you can try:</p>
                <ul className="text-xs text-textSecondary space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Wait a moment and retry</li>
                    <li>• Contact your IT administrator if the issue persists</li>
                </ul>
            </div>

            <div className="flex gap-3 w-full">
                <button
                    onClick={() => navigate("/")}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-text hover:bg-surfaceHover transition-colors"
                >
                    <HiOutlineHome size={16} />
                    Home
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{
                        background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                        boxShadow: "0 4px 12px rgba(249,222,8,0.35)",
                        color: "#111111"
                    }}
                >
                    <HiOutlineRefresh size={16} />
                    Try Again
                </button>
            </div>
        </div>
    )
}

export default ConnectionStatusPage
