import React from "react";
import clsx from "clsx";


const hole_ratio = 1/6

// export default function CD({imageSrc, name, isSpinning, style}: {imageSrc: string, name: string, isSpinning: boolean, style: React.CSSProperties}) {
//     const holeSize = (hole_ratio * 100).toString()

//     style.animationPlayState = isSpinning ? 'running': 'paused'

//     return (
//         <div className={`relative rounded-full overflow-hidden shadow-lg animate-disc-spin`} style={style}>
//             <img src={imageSrc} alt={name} className="w-full h-full object-cover"/>
//             <div 
//                 className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 ${isSpinning ? 'opacity-0' : 'opacity-50'}`}
//             />
//             <div style={{ width: `${holeSize}%`, height: `${holeSize}%` }} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-950 rounded-full shadow-inner`}/>

//         </div>
//     )
// }

export default function CD({imageSrc, name, isSpinning, className, style, size}: {imageSrc: string, name: string, isSpinning: boolean, className: string, style: React.CSSProperties, size: number}) {
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
                imageSrc != "" && <img src={imageSrc} alt={name} className="w-full h-full object-cover animate-disc-spin" style={{animationPlayState: isSpinning ? 'running' : 'paused',}}/>
            }
            <div 
                className={`absolute top-0 left-0 w-full h-full bg-black transition-opacity duration-300 ${isSpinning ? 'opacity-0' : 'opacity-50'}`}
            />
            <div style={{ width: `${holeSize}%`, height: `${holeSize}%` }} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-950 rounded-full shadow-inner`}/>

        </div>
    )
}