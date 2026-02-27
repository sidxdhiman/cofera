import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import logo from "@/assets/logo.svg"
import { useAppContext } from "@/context/AppContext"
import { MdDelete } from "react-icons/md"

interface Pod {
    id: string
    podId: string
    name: string
    updatedAt: string
    filesCount?: number
}

function LaunchPadPage() {
    const navigate = useNavigate()
    const { setCurrentUser } = useAppContext()
    const [pods, setPods] = useState<Pod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [podToDelete, setPodToDelete] = useState<Pod | null>(null)
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newPodName, setNewPodName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        const fetchPods = async () => {
            const token = localStorage.getItem("token")
            if (!token) {
                navigate("/")
                return
            }

            try {
                const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
                const response = await fetch(`${baseUrl}/api/pods`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setPods(data)
                } else {
                    toast.error("Failed to load your pods")
                    if (response.status === 401) {
                        localStorage.removeItem("token")
                        navigate("/")
                    }
                }
            } catch (error) {
                toast.error("Error connecting to server")
            } finally {
                setIsLoading(false)
            }
        }

        fetchPods()
    }, [navigate])

    const fetchPods = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
            const response = await fetch(`${baseUrl}/api/pods`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setPods(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateNewPod = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPodName.trim()) return

        setIsCreating(true)
        const username = localStorage.getItem("username") || "Guest"
        const podId = uuidv4()

        const token = localStorage.getItem("token")
        if (token) {
            try {
                const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
                await fetch(`${baseUrl}/api/pods/save`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ podId, name: newPodName.trim() })
                })
            } catch (error) {
                console.error("Failed to save pod name", error)
            }
        }

        setCurrentUser({ username, roomId: podId })
        navigate(`/editor/${podId}`, { state: { username } })
    }

    const getFakeResources = (podId: string, realFilesCount?: number) => {
        const num = podId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        let filesCount = (num % 150) + 5
        let memory = ((filesCount * 18.5) / 1024).toFixed(2)
        let cpu = ((num % 45) + 0.5).toFixed(1)

        if (realFilesCount !== undefined) {
            filesCount = realFilesCount
            memory = ((filesCount * 4.5 + 50) / 1024).toFixed(3) // calculate realistic fake memory from true file count
            cpu = (((num % 25) + 1.0) * (filesCount > 0 ? 1 : 0)).toFixed(1)
        }

        return { filesCount, memory, cpu }
    }

    const handleJoinPod = (podId: string) => {
        const username = localStorage.getItem("username") || "Guest"
        setCurrentUser({ username, roomId: podId })
        navigate(`/editor/${podId}`, { state: { username } })
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("username")
        navigate("/")
        toast.success("Logged out successfully")
    }

    const handleDeletePod = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!podToDelete) return

        if (deleteConfirmationText !== podToDelete.name) {
            toast.error("Pod name does not match")
            return
        }

        setIsDeleting(true)
        const token = localStorage.getItem("token")
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
            const response = await fetch(`${baseUrl}/api/pods/${podToDelete.podId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (response.ok) {
                toast.success("Pod deleted successfully")
                setPodToDelete(null)
                setDeleteConfirmationText("")
                fetchPods() // Refresh list
            } else {
                toast.error("Failed to delete pod")
            }
        } catch (error) {
            toast.error("Error connecting to server")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-8">
            <div className="w-full max-w-4xl flex items-center justify-between mb-12">
                <img src={logo} alt="Logo" className="w-[150px]" />
                <div className="flex items-center gap-4">
                    <span className="text-text font-medium text-lg">
                        Welcome, {localStorage.getItem("username")}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-border px-4 py-2 hover:bg-surfaceHover transition-colors text-text"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-text">Your Pods</h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-lg bg-primary hover:bg-primaryHover hover:shadow-google text-white px-6 py-3 font-medium transition-all"
                    >
                        + Create New Pod
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center text-textSecondary py-12">Loading your pods...</div>
                ) : pods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pods.map((pod) => {
                            const resources = getFakeResources(pod.podId, pod.filesCount)
                            return (
                                <div
                                    key={pod.id}
                                    onClick={() => handleJoinPod(pod.podId)}
                                    className="bg-surface border border-border p-6 rounded-2xl shadow-google dark:shadow-none hover:-translate-y-1 hover:shadow-google-hover transition-all cursor-pointer flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-text break-all pr-4 group-hover:text-primary transition-colors">{pod.name}</h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPodToDelete(pod);
                                                }}
                                                className="text-textSecondary hover:text-danger hover:bg-danger/10 p-2 rounded-full transition-colors flex-shrink-0"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-textSecondary font-mono tracking-tight">{pod.podId}</p>
                                    </div>

                                    {/* Fake Resources Section */}
                                    <div className="mt-4 grid grid-cols-2 gap-2 bg-surfaceHover p-3 rounded-xl border border-border">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-textSecondary">Resources</span>
                                            <span className="text-xs text-text">{resources.memory} GB</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-textSecondary">CPU Usage</span>
                                            <span className="text-xs text-text">{resources.cpu}%</span>
                                        </div>
                                        <div className="flex flex-col col-span-2 mt-1">
                                            <span className="text-[10px] uppercase font-bold text-textSecondary">Files</span>
                                            <span className="text-xs text-text">{resources.filesCount} workspace files</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between text-xs text-textSecondary">
                                        <span>Updated {new Date(pod.updatedAt).toLocaleDateString()}</span>
                                        <span className="bg-primary hover:bg-primaryHover text-white px-3 py-1.5 rounded-lg border border-primary/20 transition-colors font-medium">Enter Pod</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center bg-surface border border-border rounded-2xl p-12 shadow-google dark:shadow-none">
                        <h2 className="text-xl font-semibold text-text mb-2">No Pods Found</h2>
                        <p className="text-textSecondary mb-6">You haven't created any pods yet. Generate one to get started!</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="rounded-lg bg-primary hover:bg-primaryHover text-white px-6 py-3 font-medium transition-colors hover:shadow-google"
                        >
                            Create your first Pod
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {podToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
                    <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface p-8 shadow-google dark:shadow-none transition-all">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold text-text">Delete Pod?</h2>
                            <p className="text-textSecondary text-sm">
                                This action cannot be undone. This will permanently delete the pod <span className="font-bold text-text">{podToDelete.name}</span>.
                            </p>
                            <p className="text-textSecondary text-sm mt-2">
                                Please type <strong className="text-text">{podToDelete.name}</strong> to confirm.
                            </p>
                        </div>

                        <form onSubmit={handleDeletePod} className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder={podToDelete.name}
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-3 focus:outline-none focus:ring-2 focus:ring-danger/50 focus:border-danger transition-all"
                            />
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPodToDelete(null);
                                        setDeleteConfirmationText("");
                                    }}
                                    className="flex-1 rounded-lg border border-border px-4 py-3 font-semibold text-text hover:bg-surfaceHover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDeleting || deleteConfirmationText !== podToDelete.name}
                                    className="flex-1 rounded-lg bg-danger px-4 py-3 font-semibold text-white transition-all disabled:opacity-50 hover:bg-danger/90 hover:shadow-google disabled:hover:shadow-none"
                                >
                                    {isDeleting ? "Deleting..." : "Delete Pod"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Pod Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
                    <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface p-8 shadow-google dark:shadow-none transition-all animate-up-down">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-bold text-text">Name your Pod</h2>
                            <p className="text-textSecondary text-sm">
                                Give your new workspace a recognizable name.
                            </p>
                        </div>

                        <form onSubmit={handleCreateNewPod} className="flex flex-col gap-4">
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. NextJS Portfolio, Python Scraper..."
                                value={newPodName}
                                onChange={(e) => setNewPodName(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surfaceHover px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setNewPodName("");
                                    }}
                                    className="flex-1 rounded-lg border border-border px-4 py-3 font-semibold text-text hover:bg-surfaceHover transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newPodName.trim()}
                                    className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all disabled:opacity-50 hover:bg-primaryHover hover:shadow-google disabled:hover:shadow-none"
                                >
                                    {isCreating ? "Creating..." : "Create Pod"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LaunchPadPage
