import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import { useState, useRef, useEffect } from "react"
import toast from "react-hot-toast"
import { VscVscode } from "react-icons/vsc"

const menuItems = [
    { label: "File", menu: ["New File", "New Folder", "Save All"] },
    { label: "Edit", menu: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
    { label: "Selection", menu: ["Select All"] },
    { label: "View", menu: ["Toggle Sidebar", "Zoom In", "Zoom Out"] },
    { label: "Go", menu: ["Go to Line"] },
    { label: "Run", menu: ["Run Code"] },
    { label: "Terminal", menu: ["New Terminal"] },
    { label: "Help", menu: ["Documentation", "Keyboard Shortcuts"] },
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

    const handleMenuClick = (menuItem: string, action: string) => {
        setActiveMenu(null)
        if (action === "Save All") {
            socket.emit("SYNC_WORKSPACE_TO_DISK", {
                roomId: currentUser.roomId,
                fileStructure
            })
            toast.success("Workspace synced to disk")
        } else {
            toast.success(`${action} selected`)
        }
    }

    return (
        <div className="flex h-9 w-full select-none items-center justify-between border-b border-border bg-[#181818] px-2 text-[13px] text-[#cccccc]">
            <div className="flex items-center gap-2" ref={menuRef}>
                <div className="mr-2 flex items-center justify-center pt-[2px] text-[#007acc]">
                    <VscVscode size={18} />
                </div>
                {menuItems.map((item) => (
                    <div key={item.label} className="relative">
                        <button
                            className={`rounded px-2 pt-[2px] pb-[3px] transition-colors hover:bg-[#333333] ${activeMenu === item.label ? "bg-[#333333] text-white" : ""
                                }`}
                            onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}
                        >
                            {item.label}
                        </button>
                        {activeMenu === item.label && (
                            <div className="absolute left-0 top-full z-50 mt-[1px] min-w-[200px] rounded-md border border-[#454545] bg-[#252526] py-1 shadow-lg">
                                {item.menu.map((subItem) => (
                                    <button
                                        key={subItem}
                                        className="flex w-full items-center px-6 py-1.5 text-left text-sm hover:bg-[#04395e] hover:text-white"
                                        onClick={() => handleMenuClick(item.label, subItem)}
                                    >
                                        {subItem}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex-1 text-center text-[12px] opacity-80">
                {activeFile ? `${activeFile.name} - Cofera Pod` : "Cofera - Antigravity"}
            </div>
            <div className="flex items-center gap-4 text-[12px] pr-2">
                <button className="flex items-center gap-1 rounded bg-[#007acc] px-2 py-[2px] text-white transition-opacity hover:opacity-90">
                    <span className="w-4 h-4 rounded-full bg-white text-[#007acc] inline-flex items-center justify-center font-bold text-[10px]">1</span>
                    Restart to Update →
                </button>
            </div>
        </div>
    )
}

export default EditorTopBar
