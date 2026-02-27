import React, { useEffect, useRef } from "react"
import { Terminal as XTerm } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import "@xterm/xterm/css/xterm.css"
import { useSocket } from "@/context/SocketContext"

import { useAppContext } from "@/context/AppContext"

interface TerminalProps {
    isOpen: boolean
    onClose: () => void
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose }) => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const { socket } = useSocket()
    const { currentUser } = useAppContext()
    const initializedRef = useRef<boolean>(false)

    useEffect(() => {
        if (!isOpen || !terminalRef.current || initializedRef.current) return

        const terminal = new XTerm({
            cursorBlink: true,
            theme: {
                background: "#1e1e1e",
                foreground: "#f5f5f5",
                cursor: "#f5f5f5"
            }
        })
        xtermRef.current = terminal as any

        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon as any)
        fitAddonRef.current = fitAddon as any

        terminal.open(terminalRef.current)
        fitAddon.fit()

        terminal.onData((data: string) => {
            socket.emit("TERMINAL_INPUT", data)
        })

        // Ask server to initialize
        const emitInit = () => {
            socket.emit("TERMINAL_INIT", {
                cols: terminal.cols,
                rows: terminal.rows,
                roomId: currentUser.roomId
            })
        }

        emitInit()

        const handleResize = () => {
            fitAddon.fit()
            socket.emit("TERMINAL_RESIZE", { cols: terminal.cols, rows: terminal.rows })
        }
        window.addEventListener("resize", handleResize)

        initializedRef.current = true

        return () => {
            window.removeEventListener("resize", handleResize)
            terminal.dispose()
            initializedRef.current = false
        }
    }, [isOpen, socket])

    useEffect(() => {
        if (!isOpen) return

        const handleTerminalResponse = (data: string) => {
            if (xtermRef.current) {
                xtermRef.current.write(data)
            }
        }

        socket.on("TERMINAL_RESPONSE", handleTerminalResponse)

        return () => {
            socket.off("TERMINAL_RESPONSE", handleTerminalResponse)
        }
    }, [isOpen, socket])

    if (!isOpen) return null

    return (
        <div className="absolute bottom-0 left-0 z-[100] flex h-64 w-full flex-col bg-[#1e1e1e] border-t border-gray-600">
            <div className="flex h-8 items-center justify-between bg-surface px-4 py-1 text-sm text-textSecondary">
                <span>Terminal</span>
                <button onClick={onClose} className="hover:text-text">✕</button>
            </div>
            <div className="flex-grow p-2 overflow-hidden" ref={terminalRef} />
        </div>
    )
}

export default Terminal
