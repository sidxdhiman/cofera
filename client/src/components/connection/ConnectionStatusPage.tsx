import { useNavigate } from "react-router-dom"

function ConnectionStatusPage() {
    return (
        <div className="flex h-screen min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
            <ConnectionError />
        </div>
    )
}

const ConnectionError = () => {
    const navigate = useNavigate()
    const reloadPage = () => {
        window.location.reload()
    }

    const gotoHomePage = () => {
        navigate("/")
    }

    return (
        <>
            <span className="whitespace-break-spaces text-lg font-medium text-slate-300">
                Oops! Something went wrong. Please try again
            </span>
            <div className="flex flex-wrap justify-center gap-4">
                <button
                    className="mr-4 rounded-lg bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-8 py-2 font-bold text-white"
                    onClick={reloadPage}
                >
                    Try Again
                </button>
                <button
                    className="rounded-lg bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-8 py-2 font-bold text-white"
                    onClick={gotoHomePage}
                >
                    Go to HomePage
                </button>
            </div>
        </>
    )
}

export default ConnectionStatusPage
