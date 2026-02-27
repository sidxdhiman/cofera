import fs from "fs"
import path from "path"

const dataPath = path.join(__dirname, "../../data")

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
}

export const readDb = (fileName: string) => {
    const filePath = path.join(dataPath, fileName)
    if (!fs.existsSync(filePath)) {
        return []
    }
    const data = fs.readFileSync(filePath, "utf-8")
    return data ? JSON.parse(data) : []
}

export const writeDb = (fileName: string, data: any) => {
    const filePath = path.join(dataPath, fileName)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}
