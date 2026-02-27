import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import AuthModal from "@/components/common/AuthModal"
import { useState } from "react"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const [authModalConfig, setAuthModalConfig] = useState<{ isOpen: boolean, mode: "login" | "signup" }>({ isOpen: false, mode: "login" })

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Pod Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a pod id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("Pod Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining pod...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    // Redirect to launchpad if already logged in
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            navigate("/launchpad")
        }
    }, [navigate])

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div className="flex w-full max-w-[450px] flex-col items-center justify-center gap-6 rounded-2xl bg-surface p-8 shadow-google dark:shadow-none sm:w-[450px]">
            <div className="w-full text-center">
                <h1 className="text-5xl font-black text-primary font-satoshi tracking-tight">Cofera</h1>
            </div>
            <form onSubmit={joinRoom} className="flex w-full flex-col gap-4">
                <input
                    type="text"
                    name="roomId"
                    placeholder="Pod Id"
                    className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    onChange={handleInputChanges}
                    value={currentUser.roomId}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    onChange={handleInputChanges}
                    value={currentUser.username}
                    ref={usernameRef}
                />
                <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-8 py-3 text-lg font-semibold text-white"
                >
                    Join
                </button>
            </form>
            <button
                className="cursor-pointer select-none text-primary hover:text-primaryHover hover:underline transition-colors"
                onClick={createNewRoomId}
            >
                Generate Unique Pod Id
            </button>
            <div className="mt-4 flex w-full flex-col items-center justify-center gap-2">
                <span className="text-sm text-textSecondary">Want to use saved pods?</span>
                <div className="flex gap-4">
                    <button
                        className="rounded-lg border border-primary px-6 py-2 text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setAuthModalConfig({ isOpen: true, mode: "login" })}
                    >
                        Log In
                    </button>
                    <button
                        className="rounded-lg border border-primary px-6 py-2 text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setAuthModalConfig({ isOpen: true, mode: "signup" })}
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            <AuthModal
                isOpen={authModalConfig.isOpen}
                onClose={() => setAuthModalConfig({ ...authModalConfig, isOpen: false })}
                initialMode={authModalConfig.mode}
                onSuccess={() => {
                    const savedUsername = localStorage.getItem("username")
                    if (savedUsername) {
                        setCurrentUser({ ...currentUser, username: savedUsername })
                    }
                    navigate("/launchpad")
                }}
            />
        </div>
    )
}

export default FormComponent
