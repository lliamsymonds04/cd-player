import React from "react";

const hole_ratio = 1/6

export default function CD({imageSrc, name, isSpinning}: {imageSrc: string, name: string, isSpinning: boolean}) {
    const holeSize = (hole_ratio * 100).toString()

    return (
        <div className={`relative rounded-full overflow-hidden shadow-lg animate-disc-spin`} style={{animationPlayState: isSpinning ? 'running': 'paused'}}>
            <img src={imageSrc} alt={name} className="w-full h-full object-cover"/>
            <div 
                className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 ${isSpinning ? 'opacity-0' : 'opacity-50'}`}
            />
            <div style={{ width: `${holeSize}%`, height: `${holeSize}%` }} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-950 rounded-full shadow-inner`}/>

        </div>
    )
}