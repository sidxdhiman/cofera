import { Route, BrowserRouter as Router, Routes } from "react-router-dom"

import Toast from "./components/toast/Toast"
import EditorPage from "./pages/EditorPage"
import HomePage from "./pages/HomePage"
import LaunchPadPage from "./pages/LaunchPadPage"

const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/launchpad" element={<LaunchPadPage />} />
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
            </Router>
            <Toast /> {/* Toast component from react-hot-toast */}

        </>
    )
}

export default App
