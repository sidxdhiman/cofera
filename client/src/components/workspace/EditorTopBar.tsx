import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import { useState, useRef, useEffect } from "react"
import toast from "react-hot-toast"
import { RiCodeBoxLine } from "react-icons/ri"

import { VscCircleFilled } from "react-icons/vsc"

const menuItems = [
    {
        label: "File",
        menu: ["New File", "New Folder", "Save All", "---", "Close Pod"],
    },
    { label: "Edit", menu: ["Undo", "Redo", "---", "Cut", "Copy", "Paste"] },
    { label: "Selection", menu: ["Select All", "Expand Selection"] },
    {
        label: "View",
        menu: ["Toggle Sidebar", "---", "Zoom In", "Zoom Out", "Reset Zoom"],
    },
    { label: "Go", menu: ["Go to Line", "Go to File"] },
    { label: "Run", menu: ["Run Code"] },
    { label: "Terminal", menu: ["New Terminal", "Split Terminal"] },
    { label: "Help", menu: ["Documentation", "Keyboard Shortcuts", "---", "About Cofera"] },
]

function EditorTopBar() {
    const { currentUser } = useAppContext()
    const { fileStructure, activeFile } = useFileSystem()
    const { socket } = useSocket()
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setActiveMenu(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMenuClick = (_menuItem: string, action: string) => {
        setActiveMenu(null)
        if (action === "Save All") {
            socket.emit("SYNC_WORKSPACE_TO_DISK", {
                roomId: currentUser.roomId,
                fileStructure,
            })
            toast.success("Workspace synced")
        } else if (action === "---") {
            return
        } else {
            toast.success(`${action}`)
        }
    }

    return (
        <div
            className="flex h-10 shrink-0 w-full select-none items-center justify-between border-b"
            style={{
                background: "#0f1117",
                borderColor: "rgba(255,255,255,0.08)",
            }}
        >
            {/* Left: brand + menu */}
            <div className="flex items-center h-full" ref={menuRef}>
                {/* Brand mark */}
                <div
                    className="flex items-center gap-2 px-4 h-full border-r"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                    <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #f9de08, #e8ce00)" }}
                    >
                        <RiCodeBoxLine size={11} color="white" />
                    </div>
                    <span
                        className="text-xs font-bold tracking-tight"
                        style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                        Cofera
                    </span>
                </div>

                {/* Menu items */}
                <div className="flex items-center h-full pl-1">
                    {menuItems.map((item) => (
                        <div key={item.label} className="relative h-full flex items-center">
                            <button
                                className="flex items-center gap-0.5 h-full px-3 text-[12px] font-medium transition-all"
                                style={{
                                    color:
                                        activeMenu === item.label
                                            ? "rgba(255,255,255,0.95)"
                                            : "rgba(255,255,255,0.55)",
                                    background:
                                        activeMenu === item.label
                                            ? "rgba(255,255,255,0.1)"
                                            : "transparent",
                                }}
                                onClick={() =>
                                    setActiveMenu(activeMenu === item.label ? null : item.label)
                                }
                                onMouseEnter={() => {
                                    if (activeMenu !== null) setActiveMenu(item.label)
                                }}
                            >
                                {item.label}
                            </button>

                            {activeMenu === item.label && (
                                <div
                                    className="absolute left-0 top-full z-50 min-w-[200px] rounded-lg overflow-hidden py-1"
                                    style={{
                                        background: "#1e2027",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                                        marginTop: "1px",
                                    }}
                                >
                                    {item.menu.map((subItem, idx) =>
                                        subItem === "---" ? (
                                            <div
                                                key={idx}
                                                className="my-1 mx-2"
                                                style={{
                                                    height: "1px",
                                                    background: "rgba(255,255,255,0.08)",
                                                }}
                                            />
                                        ) : (
                                            <button
                                                key={subItem}
                                                className="flex w-full items-center px-4 py-1.5 text-left text-[13px] transition-colors"
                                                style={{ color: "rgba(255,255,255,0.75)" }}
                                                onMouseEnter={(e) => {
                                                    ; (e.target as HTMLElement).style.background =
                                                        "rgba(249,222,8,0.25)"
                                                        ; (e.target as HTMLElement).style.color = "white"
                                                }}
                                                onMouseLeave={(e) => {
                                                    ; (e.target as HTMLElement).style.background =
                                                        "transparent"
                                                        ; (e.target as HTMLElement).style.color =
                                                            "rgba(255,255,255,0.75)"
                                                }}
                                                onClick={() => handleMenuClick(item.label, subItem)}
                                            >
                                                {subItem}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Center: file name */}
            <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[12px]"
                style={{ color: "rgba(255,255,255,0.5)" }}
            >
                {activeFile && (
                    <>
                        <VscCircleFilled size={8} style={{ color: "#7a6200" }} />
                        <span style={{ color: "rgba(255,255,255,0.75)" }}>
                            {activeFile.name}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>—</span>
                    </>
                )}
                <span>Cofera Pod</span>
            </div>

            {/* Right: pod info */}
            <div
                className="flex items-center gap-3 pr-4 text-[11px]"
                style={{ color: "rgba(255,255,255,0.4)" }}
            >
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#0f9d58" }}
                    />
                    <span style={{ color: "rgba(255,255,255,0.55)" }}>
                        {currentUser.username || "Guest"}
                    </span>
                </div>
                <div
                    className="hidden sm:flex items-center gap-1.5 font-mono px-2 py-0.5 rounded"
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.4)",
                    }}
                >
                    {currentUser.roomId?.slice(0, 8) || "—"}
                </div>
            </div>
        </div>
    )
}

export default EditorTopBar
