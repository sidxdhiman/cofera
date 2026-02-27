import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { IoCodeSlash } from "react-icons/io5"
import { MdOutlineDraw } from "react-icons/md"
import cn from "classnames"
import { Tooltip } from 'react-tooltip'
import { useState } from 'react'
import { tooltipStyles } from "./tooltipStyles"
import { IoCloudUploadOutline, IoRocketOutline } from "react-icons/io5"
import { useNavigate } from "react-router-dom"
import LeaveModal from "@/components/common/LeaveModal"
import AuthModal from "@/components/common/AuthModal"
import toast from "react-hot-toast"
import { USER_STATUS } from "@/types/user"

function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
        setIsSidebarOpen,
    } = useViews()
    const { minHeightReached } = useResponsive()
    const { activityState, setActivityState } = useAppContext()
    const { socket } = useSocket()
    const { isMobile } = useWindowDimensions()
    const [showTooltip, setShowTooltip] = useState(true)
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
    const [authModalConfig, setAuthModalConfig] = useState<{ isOpen: boolean, mode: "login" | "signup" }>({ isOpen: false, mode: "login" })
    const navigate = useNavigate()
    const { setStatus, currentUser } = useAppContext()

    const handleLeave = () => {
        const token = localStorage.getItem("token")
        if (token) {
            handleSavePod(true)
        } else {
            setIsLeaveModalOpen(true)
        }
    }

    const leaveWithoutSaving = () => {
        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate("/", { replace: true })
        setIsLeaveModalOpen(false)
    }

    const saveAndLogin = () => {
        setIsLeaveModalOpen(false)
        setAuthModalConfig({ isOpen: true, mode: "login" })
    }

    const saveAndSignup = () => {
        setIsLeaveModalOpen(false)
        setAuthModalConfig({ isOpen: true, mode: "signup" })
    }

    const handleSavePod = async (redirectToLaunchpad = false) => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
            const response = await fetch(`${baseUrl}/api/pods/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ podId: currentUser.roomId })
            })

            if (response.ok) {
                toast.success("Pod saved successfully!")
                if (redirectToLaunchpad === true) {
                    socket.disconnect();
                    setStatus(USER_STATUS.DISCONNECTED);
                    navigate("/launchpad", { replace: true });
                } else {
                    leaveWithoutSaving();
                }
            } else {
                const data = await response.json()
                toast.error(data.error || "Failed to save pod")
            }
        } catch (error) {
            toast.error("Failed to connect to server")
        }
    }

    const changeState = () => {
        setShowTooltip(false)
        if (activityState === ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            socket.emit(SocketEvent.REQUEST_DRAWING)
        } else {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    return (
        <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
            <div
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-[50px] w-full gap-4 self-end overflow-hidden border-t border-border bg-surface p-2 md:static md:h-full md:w-[50px] md:min-w-[50px] md:flex-col md:border-r md:border-t-0 md:p-2 md:pt-4",
                    {
                        hidden: minHeightReached,
                    },
                )}
            >
                <SidebarButton
                    viewName={VIEWS.FILES}
                    icon={viewIcons[VIEWS.FILES]}
                />
                <SidebarButton
                    viewName={VIEWS.CHATS}
                    icon={viewIcons[VIEWS.CHATS]}
                />
                <SidebarButton
                    viewName={VIEWS.COPILOT}
                    icon={viewIcons[VIEWS.COPILOT]}
                />
                <SidebarButton
                    viewName={VIEWS.RUN}
                    icon={viewIcons[VIEWS.RUN]}
                />
                <SidebarButton
                    viewName={VIEWS.CLIENTS}
                    icon={viewIcons[VIEWS.CLIENTS]}
                />
                <SidebarButton
                    viewName={VIEWS.SETTINGS}
                    icon={viewIcons[VIEWS.SETTINGS]}
                />

                {/* Button to change activity state coding or drawing */}
                <div className="flex h-fit flex-col items-center justify-center gap-2">
                    <button
                        className="justify-center flex items-center rounded-lg p-1.5 transition-colors duration-200 ease-in-out hover:bg-surfaceHover text-textSecondary hover:text-text text-textSecondary"
                        onClick={changeState}
                        onMouseEnter={() => setShowTooltip(true)}
                        data-tooltip-id="activity-state-tooltip"
                        data-tooltip-content={
                            activityState === ACTIVITY_STATE.CODING
                                ? "Switch to Drawing Mode"
                                : "Switch to Coding Mode"
                        }
                    >
                        {activityState === ACTIVITY_STATE.CODING ? (
                            <MdOutlineDraw size={30} />
                        ) : (
                            <IoCodeSlash size={30} />
                        )}
                    </button>
                    {showTooltip && (
                        <Tooltip
                            id="activity-state-tooltip"
                            place="right"
                            offset={15}
                            className="!z-50"
                            style={tooltipStyles}
                            noArrow={false}
                            positionStrategy="fixed"
                            float={true}
                        />
                    )}

                    <button
                        className={`justify-center flex items-center rounded-lg p-1.5 transition-colors duration-200 ease-in-out mt-1 ${localStorage.getItem("token")
                            ? "hover:bg-danger hover:text-white text-textSecondary"
                            : "hover:bg-primary hover:text-white text-primary bg-primary/10"
                            }`}
                        onClick={handleLeave}
                        onMouseEnter={() => setShowTooltip(true)}
                        data-tooltip-id="leave-tooltip"
                        data-tooltip-content={localStorage.getItem("token") ? "Close & Go to Launchpad" : "Save Pod"}
                    >
                        {localStorage.getItem("token") ? <IoRocketOutline size={26} /> : <IoCloudUploadOutline size={26} />}
                    </button>
                    {showTooltip && (
                        <Tooltip
                            id="leave-tooltip"
                            place="right"
                            offset={15}
                            className="!z-50"
                            style={tooltipStyles}
                            noArrow={false}
                            positionStrategy="fixed"
                            float={true}
                        />
                    )}
                </div>
            </div>
            <LeaveModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onLeaveWithoutSaving={leaveWithoutSaving}
                onSaveAndLogin={saveAndLogin}
                onSaveAndSignup={saveAndSignup}
            />
            <AuthModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
                initialMode={authModalConfig.mode}
                onSuccess={() => handleSavePod(true)}
            />
            <div
                className="absolute left-0 top-0 z-20 w-full flex-col bg-surface md:static md:min-w-[300px]"
                style={isSidebarOpen ? {} : { display: "none" }}
            >
                {/* Render the active view component */}
                {viewComponents[activeView]}
            </div>
        </aside>
    )
}

export default Sidebar
