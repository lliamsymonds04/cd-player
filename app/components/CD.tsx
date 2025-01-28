import React from "react";
import clsx from "clsx";


const hole_ratio = 1/6

interface paramsCD {imageSrc: string, name: string, isSpinning: boolean, className: string, style: React.CSSProperties, size: number, position: number}

export default function CD({imageSrc, name, isSpinning, className, style, size, position}: paramsCD) {
    const holeSize = (hole_ratio * 100).toString()

    const combinedStyle: React.CSSProperties = {
        ...style,
        width: `${size}rem`
      };

    return (
        <div className={clsx(
            "rounded-full overflow-hidden shadow-lg  bg-slate-900 transition-all duration-500 -translate-x-1/2 -translate-y-1/2",
            className
          )} style={combinedStyle}>
            {
                imageSrc != "" && (position == 0 ? <img src={imageSrc} alt={name} className="w-full h-full object-cover animate-disc-spin" style={{animationPlayState: isSpinning ? 'running' : 'paused',}}/>
                    : <img src={imageSrc} alt={name} className="w-full h-full object-cover"/>
                )
            }
            <div 
                className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 `}
                style = {{
                    opacity: isSpinning ? 0 : (0.5 + Math.abs(position) * 0.1)
                }}
            />
            <div style={{ width: `${holeSize}%`, height: `${holeSize}%` }} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-950 rounded-full shadow-inner`}/>

        </div>
    )
}