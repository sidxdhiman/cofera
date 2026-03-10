import Users from "@/components/common/Users"
import InviteTeamModal from "@/components/common/InviteTeamModal"
import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import useResponsive from "@/hooks/useResponsive"
import { USER_STATUS } from "@/types/user"
import toast from "react-hot-toast"
import { GoSignOut } from "react-icons/go"
import { IoShareOutline } from "react-icons/io5"
import { LuCopy } from "react-icons/lu"
import { HiOutlineUserAdd } from "react-icons/hi"
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
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    const isLoggedIn = !!localStorage.getItem("token")

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
        <div className="flex flex-col" style={{ height: viewHeight }}>
            {/* Section header */}
            <div className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h1 className="text-sm font-bold text-textSecondary uppercase tracking-widest">
                        Active Users
                    </h1>
                    {isLoggedIn && (
                        <button
                            id="invite-team-btn"
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-90"
                            style={{
                                background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                                color: "white",
                                boxShadow: "0 2px 6px rgba(249,222,8,0.35)",
                            }}
                            title="Add Project Member"
                        >
                            <HiOutlineUserAdd size={13} />
                            Add Member
                        </button>
                    )}
                </div>
            </div>

            {/* Users list */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
                <Users />
            </div>

            {/* Bottom action bar */}
            <div
                className="flex-shrink-0 px-4 py-3 border-t border-border space-y-2"
                style={{ background: "var(--surface)" }}
            >
                {/* Invite row — shown for logged-in users prominently */}
                {isLoggedIn && (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all hover:opacity-90"
                        style={{
                            background: "linear-gradient(135deg, #f9de08, #e8ce00)",
                            boxShadow: "0 3px 10px rgba(249,222,8,0.3)",
                            color: "#111111"
                        }}
                    >
                        <HiOutlineUserAdd size={16} />
                        Add Project Member
                    </button>
                )}

                <div className="flex gap-2">
                    {/* Share URL button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-xl border border-border p-2.5 text-textSecondary hover:text-text hover:bg-surfaceHover transition-all"
                        onClick={shareURL}
                        title="Share Link"
                    >
                        <IoShareOutline size={20} />
                    </button>
                    {/* Copy URL button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-xl border border-border p-2.5 text-textSecondary hover:text-text hover:bg-surfaceHover transition-all"
                        onClick={copyURL}
                        title="Copy Link"
                    >
                        <LuCopy size={18} />
                    </button>
                    {/* Leave pod button */}
                    <button
                        className="flex flex-grow items-center justify-center rounded-xl bg-danger/10 border border-danger/20 p-2.5 text-danger hover:bg-danger hover:text-white transition-all"
                        onClick={handleLeave}
                        title="Leave pod"
                    >
                        <GoSignOut size={18} />
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
            <InviteTeamModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
            />
        </div>
    )
}

export default UsersView
