import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePause, faCirclePlay, faForwardStep, faBackwardStep } from '@fortawesome/free-solid-svg-icons'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import type { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { pauseSpotify, playSpotify, previousTrack, skipTrack } from '~/util/SpotifyUtils'
import { useState } from 'react'

function MediaButton({
    icon,
    onClick,
    size,
}: {
    icon: IconProp;
    onClick: () => void;
    size: SizeProp;
}) {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        onClick();
        setTimeout(() => setIsClicked(false), 200); // Reset after a delay
    };

    return (
        <button
            className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                isClicked ? "scale-95" : ""
            }`}
            onClick={handleClick}
        >
            <FontAwesomeIcon
                icon={icon}
                size={size}
                className={`${isClicked ? "text-gray-600" : ""} transition-shadow duration-100`}
            />
        </button>
    );
}

export default function Playback({trackName, isPlaying, artist, playButtonPressed}: {trackName: string, isPlaying: boolean, artist: string, playButtonPressed: (b: boolean) => void}) {
    return (
        <div className="bg-slate-900 rounded-lg w-96 shadow-md flex flex-col items-center p-2">
            <div  className='flex flex-row  gap-2 items-center'>
                <FontAwesomeIcon icon={faSpotify} size="xl"/>
                <p className="font-bold text-lg text-center">{trackName}</p>
            </div>
            <p className="text-sm">- {artist}</p>
            <div className='mt-4 flex flex-row gap-3 justify-center'>
                <MediaButton icon={faBackwardStep} size="lg" onClick={() => {
                    previousTrack()
                }}/>
                <MediaButton icon={isPlaying ? faCirclePause: faCirclePlay} size="2xl" onClick={() => {
                    if (isPlaying) {
                        pauseSpotify()
                        playButtonPressed(false)
                    } else {
                        playSpotify()
                        playButtonPressed(true)
                    }
                    // playButtonPressed(!isPlaying)
                }} />
                <MediaButton icon={faForwardStep} size="lg" onClick={() => {
                    skipTrack()
                }}/>
            </div>
        </div>
    )

}