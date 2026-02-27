import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"
import Terminal from "@/components/terminal/Terminal"
import { useState, useEffect } from "react"
import EditorTopBar from "./EditorTopBar"

function WorkSpace() {
    const { viewHeight } = useResponsive()
    const { activityState } = useAppContext()
    const [isTerminalOpen, setIsTerminalOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "`") {
                e.preventDefault()
                setIsTerminalOpen((prev) => !prev)
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <div
            className="absolute left-0 top-0 flex w-full max-w-full flex-col flex-grow overflow-hidden md:static"
            style={{ height: viewHeight }}
        >
            <EditorTopBar />
            <div className="relative flex-grow overflow-hidden">
                {activityState === ACTIVITY_STATE.DRAWING ? (
                    <DrawingEditor />
                ) : (
                    <EditorComponent />
                )}
            </div>
            {/* Terminal will render here underneath the editor, constrained to the workspace width */}
            <Terminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
        </div>
    )
}

export default WorkSpace
