import { useAppContext } from "@/context/AppContext"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { LuCopy, LuCheck } from "react-icons/lu"

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
}

const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
    const { currentUser } = useAppContext()
    const [isCopied, setIsCopied] = useState(false)

    if (!isOpen) return null

    const url = window.location.href

    const copyURL = async () => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success("URL copied to clipboard")
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (error) {
            toast.error("Unable to copy URL")
            console.log(error)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
            <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface p-8 shadow-google dark:shadow-none transition-all">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-text">Invite to Pod</h2>
                    <p className="text-textSecondary text-sm">
                        Share this link with others to collaborate in real-time.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Pod ID</span>
                        <div className="rounded-lg border border-border bg-surfaceHover px-4 py-3 text-text font-mono text-sm break-all">
                            {currentUser.roomId}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Share Link</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={url}
                                className="w-full rounded-lg border border-border bg-surfaceHover px-3 py-3 text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all selection:bg-primary/20"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={copyURL}
                                className="flex shrink-0 items-center justify-center rounded-lg bg-primary hover:bg-primaryHover p-3 text-white transition-all hover:shadow-google min-w-[50px]"
                                title="Copy Link"
                            >
                                {isCopied ? <LuCheck size={20} /> : <LuCopy size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-lg border border-border px-4 py-3 text-center font-semibold text-text transition-colors hover:bg-surfaceHover"
                >
                    Close
                </button>
            </div>
        </div>
    )
}

export default ShareModal
