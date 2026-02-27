import { ChangeEvent } from "react"
import { PiCaretDownBold } from "react-icons/pi"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
}

function Select({ onChange, value, options, title }: SelectProps) {
    return (
        <div className="relative w-full">
            <label className="mb-2">{title}</label>
            <select
                className="w-full rounded-lg border-none bg-surfaceHover px-4 py-2 text-text outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={value}
                onChange={onChange}
            >
                {options.sort().map((option) => {
                    const value = option
                    const name =
                        option.charAt(0).toUpperCase() + option.slice(1)

                    return (
                        <option key={name} value={value}>
                            {name}
                        </option>
                    )
                })}
            </select>
            <PiCaretDownBold
                size={16}
                className="absolute bottom-3 right-4 z-10 text-text"
            />
        </div>
    )
}

export default Select
