import FormComponent from "@/components/forms/FormComponent"
import { RiCodeBoxLine } from "react-icons/ri"
import { HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineUserGroup } from "react-icons/hi"
import { MdOutlineTerminal } from "react-icons/md"

const features = [
    {
        icon: <HiOutlineLightningBolt size={20} />,
        title: "Real-time Collaboration",
        desc: "Code together with your team, seeing every keystroke as it happens.",
        color: "#f9ab00",
    },
    {
        icon: <MdOutlineTerminal size={20} />,
        title: "Integrated Terminal",
        desc: "Full-featured terminal session right inside your browser.",
        color: "#0f9d58",
    },
    {
        icon: <HiOutlineShieldCheck size={20} />,
        title: "Enterprise Security",
        desc: "JWT-authenticated, domain-restricted for @carehealth.com employees only.",
        color: "#7a6200",
    },
    {
        icon: <HiOutlineUserGroup size={20} />,
        title: "Team Workspaces",
        desc: "Create persistent pods, invite teammates, and share your work.",
        color: "#a142f4",
    },
]

function HomePage() {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: "var(--background)" }}
        >
            {/* ── NAV ── */}
            <header
                className="sticky top-0 z-50 border-b border-border"
                style={{ background: "var(--surface)", backdropFilter: "blur(12px)" }}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)", color: "#111111" }}
                        >
                            <RiCodeBoxLine size={18} color="#111111" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-text">Cofera</span>
                        <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(249,222,8,0.12)", color: "#7a6200" }}
                        >
                            Enterprise
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-textSecondary">
                        <span className="hidden sm:inline">CareHealth Engineering Platform</span>
                        <span
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: "rgba(15,157,88,0.1)", color: "#0f9d58" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Live
                        </span>
                    </div>
                </div>
            </header>

            {/* ── HERO ── */}
            <div
                className="relative w-full overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #c4a800 0%, #f9de08 100%)",
                    minHeight: "420px",
                    color: "#111111"
                }}
            >
                {/* Dot grid */}
                <div
                    style={{
                        position: "absolute", inset: 0, opacity: 0.07,
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                {/* Blobs */}
                <div style={{
                    position: "absolute", right: -120, top: -120,
                    width: 480, height: 480, borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                }} />
                <div style={{
                    position: "absolute", left: -60, bottom: -100,
                    width: 320, height: 320, borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                }} />

                <div className="relative max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-12">
                    {/* Left: copy */}
                    <div className="flex-1 text-center lg:text-left">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                            style={{ background: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.8)" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                            Internal Engineering Tool — @carehealth.com only
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                            Code Together,<br />
                            <span style={{ color: "#1d4ed8" }}>Ship Faster.</span>
                        </h1>
                        <p className="text-gray-800 text-lg max-w-lg mx-auto lg:mx-0 mb-8">
                            Cofera is CareHealth's collaborative cloud IDE — real-time pair programming, integrated terminals, and persistent workspaces, all in your browser.
                        </p>

                        {/* Feature pills */}
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                            {["Real-time sync", "Live terminal", "AI Copilot", "Drawing canvas", "File system"].map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs font-semibold px-3 py-1 rounded-full"
                                    style={{ background: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.8)" }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: form card */}
                    <div
                        className="w-full max-w-sm lg:max-w-[400px] flex-shrink-0 rounded-2xl"
                        style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.35)" }}
                    >
                        <FormComponent />
                    </div>
                </div>
            </div>

            {/* ── FEATURES ── */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-10">
                    <p
                        className="text-xs font-bold uppercase tracking-widest mb-2"
                        style={{ color: "#7a6200" }}
                    >
                        Built for engineers
                    </p>
                    <h2 className="text-2xl font-black text-text">
                        Everything you need, right in the browser
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="rounded-2xl border border-border p-6 hover:-translate-y-0.5 transition-all hover:shadow-google-hover"
                            style={{ background: "var(--surface)" }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: f.color + "18", color: f.color }}
                            >
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-text mb-1">{f.title}</h3>
                            <p className="text-sm text-textSecondary">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div
                className="mt-auto border-t border-border py-5 px-6"
                style={{ background: "var(--surface)" }}
            >
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-textSecondary">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)", color: "#111111" }}
                        >
                            <RiCodeBoxLine size={11} color="#111111" />
                        </div>
                        <span className="font-semibold text-text">Cofera</span>
                        <span>· CareHealth Engineering Platform</span>
                    </div>
                    <span>© {new Date().getFullYear()} CareHealth. All rights reserved.</span>
                </div>
            </div>
        </div>
    )
}

export default HomePage
