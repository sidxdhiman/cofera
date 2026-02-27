import Users from "@/components/common/Users"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { GoSignOut } from "react-icons/go"
import { IoShareOutline } from "react-icons/io5"
import { LuCopy } from "react-icons/lu"
import { useNavigate } from "react-router-dom"
import LeaveModal from "@/components/common/LeaveModal"
import { useState } from "react"

function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    const { setStatus } = useAppContext()
    const { socket } = useSocket()
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

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

    const shareURL = async () => {
        const url = window.location.href
        try {
            await navigator.share({ url })
        } catch (error) {
            toast.error("Unable to share URL")
            console.log(error)
        }
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
            <div className="flex flex-col items-center gap-4 pt-4">
                <div className="flex w-full gap-4">
                    {/* Share URL button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-lg bg-white p-3 text-white"
                        onClick={shareURL}
                        title="Share Link"
                    >
                        <IoShareOutline size={26} />
                    </button>
                    {/* Copy URL button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-lg bg-white p-3 text-white"
                        onClick={copyURL}
                        title="Copy Link"
                    >
                        <LuCopy size={22} />
                    </button>
                    {/* Leave pod button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-lg bg-primary p-3 text-white"
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
            />
        </div>
    )
}

export default UsersView
