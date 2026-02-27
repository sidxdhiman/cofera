interface Settings {
    theme: string
    language: string
    fontSize: number
    fontFamily: string
    appMode: "light" | "dark"
}

interface SettingsContext extends Settings {
    setTheme: (theme: string) => void
    setLanguage: (language: string) => void
    setFontSize: (fontSize: number) => void
    setFontFamily: (fontFamily: string) => void
    setAppMode: (mode: "light" | "dark") => void

    resetSettings: () => void
}

export { Settings, SettingsContext }
