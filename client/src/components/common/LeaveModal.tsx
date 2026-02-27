


interface LeaveModalProps {
    isOpen: boolean
    onClose: () => void
    onLeaveWithoutSaving: () => void
    onSaveAndLogin: () => void
    onSaveAndSignup: () => void
}

const LeaveModal = ({ isOpen, onClose, onLeaveWithoutSaving, onSaveAndLogin, onSaveAndSignup }: LeaveModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
            <div
                className="flex w-full max-w-md flex-col gap-6 rounded-2xl bg-surface p-8 shadow-google dark:shadow-none transition-all"
            >
                <div className="flex flex-col gap-2 text-center">
                    <h2 className="text-2xl font-bold text-text">Leave Pod?</h2>
                    <p className="text-textSecondary">
                        Do you want to save this session? Like GitHub Codespaces, you can save your pods by signing up or logging in.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onSaveAndSignup}
                        className="w-full rounded-lg bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-primary/90"
                    >
                        Sign Up and Save
                    </button>
                    <button
                        onClick={onSaveAndLogin}
                        className="w-full rounded-lg border border-primary px-4 py-3 text-center font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                        Log In and Save
                    </button>
                    <button
                        onClick={onLeaveWithoutSaving}
                        className="w-full rounded-lg bg-surfaceHover px-4 py-3 text-center font-semibold text-text transition-colors hover:bg-danger hover:text-white"
                    >
                        Leave without saving
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-2 text-sm text-textSecondary hover:text-text underline decoration-transparent hover:decoration-text transition-all underline-offset-4"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default LeaveModal
