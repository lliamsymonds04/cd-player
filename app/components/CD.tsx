import React from "react";

const hole_ratio = 1/6



export default function CD({imageSrc, name, size, isSpinning}: {imageSrc: string, name: string, size: number, isSpinning: boolean}) {
    const holeSize = (hole_ratio * 100).toString()

    return (
        <div className={`relative rounded-full overflow-hidden w-${size.toString()} h-${size.toString()} shadow-lg animate-disc-spin`} style={{animationPlayState: isSpinning ? 'running': 'paused'}}>
            <img src={imageSrc} alt={name} className="w-full h-full object-cover"/>
            <div style={{ width: `${holeSize}%`, height: `${holeSize}%` }} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 rounded-full shadow-inner`}/>

        </div>
    )
}