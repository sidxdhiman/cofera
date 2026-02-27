import { useEffect, useState } from "react"
import useWindowDimensions from "./useWindowDimensions"

// This hook is used to hide sidebar and other components when keyboard is open on mobile devices and to adjust the height of the sidebar views and editor
function useResponsive() {
    const [minHeightReached, setMinHeightReached] = useState(false)
    const { height, isMobile } = useWindowDimensions()
    const [viewHeight, setViewHeight] = useState(height)

    useEffect(() => {
        if (height < 500 && isMobile) {
            setMinHeightReached(true)
            setViewHeight(height - 36) // Subtract 36px EditorTopBar
        } else if (isMobile) {
            setMinHeightReached(false)
            setViewHeight(height - 36 - 50) // Subtract 36px EditorTopBar + 50px Bottom Nav
        } else {
            setMinHeightReached(false)
            setViewHeight(height - 36) // Subtract 36px EditorTopBar
        }
    }, [height, isMobile])

    return { viewHeight, minHeightReached }
}

export default useResponsive
