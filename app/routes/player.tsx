import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/player";
import { getPlaying, getQueue, getRecentlyPlayed, refreshSpotifyToken } from "~/util/SpotifyUtils";
import CD from "~/components/CD";
import Playback from "~/components/Playback";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "CD Player" },
    { name: "description", content: "cd player" },
  ];
}

interface Track {
  name: string,
  image: string,
}

interface TrackObject {
  track: Track,
  position: number,
  setPosition: React.Dispatch<React.SetStateAction<number>>,
  setTrack: React.Dispatch<React.SetStateAction<Track>>,
  id: number,
}

export default function Player() {
  const accessToken = useRef<string | null>(null)
  const maxTracks = useRef(2)
  const isPlayButtonPressed = useRef(false)
  const isRefreshingToken = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentArtist, setCurrentArtist] = useState("")
  const playingRef = useRef<Track | null>(null)

  const [currentTrack, setCurrentTrack] = useState<Track>({
    name: "temp",
    image: "",
  })
  const trackCount = useRef(0)

  const trackObjects: TrackObject[] = []
  for (let i = 0; i < maxTracks.current* 2 + 3; i ++) {
    const [position, setPosition] = useState(i - (maxTracks.current + 1))
    const [track, setTrack] = useState<Track>({
      name: "",
      image: "",
    })

    trackObjects.push({
      position: position,
      setPosition: setPosition,
      track: track,
      setTrack: setTrack,
      id: trackCount.current,
    })
    trackCount.current += 1
  }

  async function updateQueue() {
    if (accessToken.current == null) {
      return
    }
    
    const usersQueue = await getQueue(accessToken.current)

    if (usersQueue) {
      for (let i = 0; i < usersQueue.queue.length && i < maxTracks.current + 1; i++) {
        const trackInfo = usersQueue.queue[i]
        const track = {
          name: trackInfo.name,
          image: trackInfo.album.images[0].url,
        }
        console.log(track.name)

        trackObjects[maxTracks.current + 2 + i].setTrack(track)
      }
    }
  }

  function shiftCdsLeft() {
    console.log(trackObjects)
    const front = trackObjects.shift()
    for (let i = 1; i < trackObjects.length; i ++) {
      const obj = trackObjects[i]
      obj.setPosition((oldPos) => {
        console.log(`${obj.track.name} new pos ${oldPos - 1}`)
        return oldPos - 1
      })
    }

    if (front) {
      trackObjects.push(front)
      front.setPosition(maxTracks.current + 1)
      front.setTrack({
        name: "",
        image: "",
      })
    }
  }

  async function handlePlaying() {
    const currentTime = new Date().getTime()
    const expireTime = Number(localStorage.getItem("spotify_token_expire_time"))

    //handle refresh token
    if (currentTime > expireTime && !isRefreshingToken.current) {
      isRefreshingToken.current = true
      await refreshSpotifyToken()
      isRefreshingToken.current = false
      accessToken.current = localStorage.getItem("spotify_access_token")
    }

    if (accessToken.current && !isRefreshingToken.current) {
      const currentlyPlaying = await getPlaying(accessToken.current)

      if (isPlayButtonPressed.current) {
        isPlayButtonPressed.current = false
        return
      }

      if (currentlyPlaying) {
        //check the first track isnt the current track
        const playingTrack = {
          name: currentlyPlaying.item.name,
          image: currentlyPlaying.item.album.images[0].url,
          album: currentlyPlaying.item.album.name
        }

        setIsPlaying(currentlyPlaying.is_playing)
        setCurrentTrack(playingTrack)
        setCurrentArtist(currentlyPlaying.item.album.artists[0].name)

        if (playingRef.current == null || playingTrack.name != playingRef.current.name) {

          if (playingRef.current != null) {
            shiftCdsLeft()
          }

          trackObjects[maxTracks.current + 1].setTrack(playingTrack)
          playingRef.current = playingTrack


          updateQueue()
        }
      } else {
        setIsPlaying(false)
      }
    }
  }


  function playButtonPressed(newState: boolean) {
    setIsPlaying(newState)
    isPlayButtonPressed.current = true
  }

  async function init() {
    if (accessToken.current) {
      return
    }
    accessToken.current = localStorage.getItem("spotify_access_token")
    playingRef.current = null

    if (accessToken.current) {
      const recentlyPlayed = await getRecentlyPlayed(accessToken.current)

      let tracksArray: Track[] = []
      
      for (let i = 0; i < recentlyPlayed.items.length && i < maxTracks.current; i ++) {
        const track = recentlyPlayed.items[i]
        trackObjects[i + 1].setTrack({
          name: track.track.name,
          image: track.track.album.images[0].url,
        })
        trackObjects[i + 1].setPosition(-1-i)
      }

      const interval = setInterval(() => {
        handlePlaying();
      }, 1000);
  
      return () => clearInterval(interval);   
    }
  }

  useEffect(() => {
    init()
  }, [])

  const cdRem = 40
  const scaleFactor = 0.125

  return (
    <div className="flex flex-col items-center  gap-5 mt-5">
      <div className="relative w-full" style={{height: `${cdRem}rem`}}>
        {trackObjects.map((obj, index) => (
          <CD imageSrc={obj.track.image} name={obj.track.name} key={index} isSpinning={obj.position == 0 && isPlaying} size={
            Math.abs(obj.position) == maxTracks.current + 1 ? 0:
            cdRem * (1 - ((Math.abs(obj.position)) * scaleFactor))
          } className={"absolute top-1/2"} style={{
            left: obj.position == 0 ? `calc(50%)`:
              obj.position < 0 ? `calc(50% + ${obj.position * cdRem/2}rem)`
              : `calc(50% + ${obj.position * cdRem/2}rem)`,
            
            zIndex: obj.position == 0 ? 10 : 10 - Math.abs(obj.position),
          }}/>
        ))}
      </div>
      <Playback isPlaying={isPlaying} trackName={currentTrack.name} artist={currentArtist} playButtonPressed={playButtonPressed}/>
    </div>
  )
}