import { useState } from "react"
import Checkbox from "./Checkbox"

export default function VolumeSlider() {

    const [volume, setVolume] = useState(window.localStorage.getItem('volume') || 50)
    const [muted, setMuted] = useState(window.localStorage.getItem('muted') || false)

    function handleChange(e) {
        const newValue = e.target.valueAsNumber
        window.localStorage.setItem('volume', newValue)
        setVolume(newValue)

    }

    function handleMute(e) {
        const isMuted = e.target.checked
        setMuted(isMuted)
        if (isMuted) {
            setVolume(0)
        } else {
            setVolume(window.localStorage.getItem('volume') || 50)
        }
        window.localStorage.setItem('muted', isMuted)
    }

    function getVolume() {
        return volume
    }

    function isMuted() {
         return muted
    }

    return(
        <div className="flex justify-center items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style={{ fill: 'rgba(255, 255, 255, 0.90)', transform: 'msFilter:' }}><path d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"></path><path d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5zM4 17h2.697l5.748 3.832a1.004 1.004 0 0 0 1.027.05A1 1 0 0 0 14 20V4a1 1 0 0 0-1.554-.832L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2zm0-8h3c.033 0 .061-.016.093-.019a1.027 1.027 0 0 0 .38-.116c.026-.015.057-.017.082-.033L12 5.868v12.264l-4.445-2.964c-.025-.017-.056-.02-.082-.033a.986.986 0 0 0-.382-.116C7.059 15.016 7.032 15 7 15H4V9z"></path></svg>
            <input id="default-range" 
            type="range" 
            min={0}
            max={100}
            value={volume} 
            onChange={handleChange}
            className="w-full h-1 bg-[#24292c] rounded-lg appearance-none cursor-pointer" />
            <Checkbox onChange={handleMute}>Mute</Checkbox>
        </div>

    )
}