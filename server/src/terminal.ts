import * as os from "os"
import * as pty from "node-pty"
import { Socket } from "socket.io"
import * as path from "path"
import * as fs from "fs"

export function setupTerminal(socket: Socket) {
    let shell = "powershell.exe"
    if (os.platform() === "win32") {
        const tryPaths = [
            "C:\\Program Files\\Git\\bin\\bash.exe",
            "C:\\Users\\SidharthDhiman\\AppData\\Local\\Programs\\Git\\bin\\bash.exe",
            "C:\\Windows\\System32\\bash.exe"
        ]
        for (const p of tryPaths) {
            if (fs.existsSync(p)) {
                shell = p
                break
            }
        }
    } else {
        shell = "bash"
    }
    const shellArgs = os.platform() === "win32" ? [] : ["--noprofile", "--norc"]

    let ptyProcess: pty.IPty | null = null
    let currentRoomId = "default"

    socket.on("TERMINAL_INIT", (dims?: { cols: number, rows: number, roomId?: string }) => {
        if (dims?.roomId) {
            currentRoomId = dims.roomId
        }

        const workspacePath = path.join(__dirname, "../../data/workspaces", currentRoomId)
        if (!fs.existsSync(workspacePath)) {
            fs.mkdirSync(workspacePath, { recursive: true })
        }

        if (ptyProcess) {
            ptyProcess.kill()
        }

        ptyProcess = pty.spawn(shell, shellArgs, {
            name: "xterm-color",
            cols: dims?.cols || 80,
            rows: dims?.rows || 30,
            cwd: workspacePath,
            env: {
                ...process.env,
                PS1: `\\[\\e[1;32m\\]pod@${currentRoomId}\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]\\$ `
            } as Record<string, string>,
        })

        ptyProcess.onData((data: string) => {
            socket.emit("TERMINAL_RESPONSE", data)
        })

        ptyProcess.onExit(() => {
            socket.emit("TERMINAL_RESPONSE", "\r\n[Process exited. Press Enter to restart]\r\n")
            ptyProcess = null
        })
    })

    socket.on("TERMINAL_INPUT", (data: string) => {
        if (!ptyProcess && data === "\r") {
            // Restart process on enter if exited
            socket.emit("TERMINAL_RESPONSE", "\r\nRestarting terminal...\r\n")

            const workspacePath = path.join(__dirname, "../../data/workspaces", currentRoomId)
            ptyProcess = pty.spawn(shell, shellArgs, {
                name: "xterm-color",
                cols: 80,
                rows: 30,
                cwd: workspacePath,
                env: {
                    ...process.env,
                    PS1: `\\[\\e[1;32m\\]pod@${currentRoomId}\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]\\$ `
                } as Record<string, string>,
            })

            ptyProcess.onData((output: string) => {
                socket.emit("TERMINAL_RESPONSE", output)
            })
            return
        }

        if (ptyProcess) {
            ptyProcess.write(data)
        }
    })

    socket.on("TERMINAL_RESIZE", (dims: { cols: number, rows: number }) => {
        if (ptyProcess) {
            try {
                ptyProcess.resize(dims.cols, dims.rows)
            } catch (e) {
                console.error("Resize failed", e)
            }
        }
    })

    socket.on("disconnect", () => {
        if (ptyProcess) {
            ptyProcess.kill()
        }
    })

    socket.on("SYNC_WORKSPACE_TO_DISK", ({ roomId, fileStructure }) => {
        if (!roomId || !fileStructure) return

        const workspacePath = path.join(__dirname, "../../data/workspaces", roomId)
        if (!fs.existsSync(workspacePath)) {
            fs.mkdirSync(workspacePath, { recursive: true })
        }

        const writeFiles = (item: any, currentPath: string) => {
            if (item.type === "file") {
                const filePath = path.join(currentPath, item.name)
                fs.writeFileSync(filePath, item.content || "")
            } else if (item.type === "directory" && item.children) {
                const dirPath = item.name === "root" ? currentPath : path.join(currentPath, item.name)
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true })
                }
                item.children.forEach((child: any) => writeFiles(child, dirPath))
            }
        }

        try {
            writeFiles(fileStructure, workspacePath)
        } catch (err) {
            console.error("Failed to write workspace to disk", err)
        }
    })
}
