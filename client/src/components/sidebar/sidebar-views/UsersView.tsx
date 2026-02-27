import Users from "@/components/common/Users"
import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { GoSignOut } from "react-icons/go"
import { IoShareOutline } from "react-icons/io5"
import { LuCopy } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import LeaveModal from "@/components/common/LeaveModal"
import ShareModal from "@/components/common/ShareModal"
import { useState } from "react"

function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    const { setStatus } = useAppContext()
    const { socket } = useSocket()
    const { downloadFilesAndFolders } = useFileSystem()
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)

    const copyURL = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("URL copied to clipboard")
        } catch (error) {
            toast.error("Unable to copy URL to clipboard")
            console.log(error)
        }
    }

    const shareURL = () => {
        setIsShareModalOpen(true)
    }

    const handleLeave = () => {
        setIsLeaveModalOpen(true)
    }

    const leaveWithoutSaving = () => {
        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate("/", { replace: true })
        setIsLeaveModalOpen(false)
    }

    const saveAndLogin = () => {
        toast.success("Login coming soon! Session saved.")
        leaveWithoutSaving()
    }

    const saveAndSignup = () => {
        toast.success("Signup coming soon! Session saved.")
        leaveWithoutSaving()
    }

    return (
        <div className="flex flex-col p-4" style={{ height: viewHeight }}>
            <h1 className="view-title">Users</h1>
            {/* List of connected users */}
            <Users />
            <div className="flex flex-col items-center gap-4 pt-4 shrink-0 mt-auto">
                <div className="flex w-full gap-4">
                    {/* Share URL button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-lg bg-white p-3 text-black hover:opacity-80 transition-opacity"
                        onClick={shareURL}
                        title="Share Link"
                    >
                        <IoShareOutline size={26} />
                    </button>
                    {/* Copy URL button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-lg bg-white p-3 text-black hover:opacity-80 transition-opacity"
                        onClick={copyURL}
                        title="Copy Link"
                    >
                        <LuCopy size={22} />
                    </button>
                    {/* Leave pod button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-lg bg-primary p-3 text-white hover:bg-primaryHover transition-colors"
                        onClick={handleLeave}
                        title="Leave pod"
                    >
                        <GoSignOut size={22} />
                    </button>
                </div>
            </div>
            <LeaveModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onLeaveWithoutSaving={leaveWithoutSaving}
                onSaveAndLogin={saveAndLogin}
                onSaveAndSignup={saveAndSignup}
                onDownload={downloadFilesAndFolders}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />
        </div>
    )
}

export default UsersView
