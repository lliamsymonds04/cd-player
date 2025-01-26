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
  album: string,
}

export default function Player() {
  const accessToken = useRef<string | null>(null)
  const maxTracks = useRef(2)
  const isPlayButtonPressed = useRef(false)
  const isRefreshingToken = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentArtist, setCurrentArtist] = useState("")
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = useState<Track[]>([])
  const playingRef = useRef<Track | null>(null)

  const [currentTrack, setCurrentTrack] = useState<Track>({
    name: "temp",
    image: "",
    album: "temp",
  })
  const [trackQueue, setTrackQueue] = useState<Track[]>([])

  async function updateQueue() {
    if (accessToken.current == null) {
      return
    }
    
    const usersQueue = await getQueue(accessToken.current)

    if (usersQueue) {
      let newQueue = []
      for (let i = 0; i < usersQueue.queue.length && i < maxTracks.current; i++) {
        const trackInfo = usersQueue.queue[i]
        const track = {
          name: trackInfo.name,
          image: trackInfo.album.images[0].url,
          album: trackInfo.album.name
        }

        newQueue.push(track)
      }

      setTrackQueue(newQueue)
    }
  }

  async function handlePlaying() {
    const currentTime = new Date().getTime()
    const expireTime = Number(localStorage.getItem("spotify_token_expire_time"))

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
          if (playingRef.current) {
            //move the current playing to recently played
            const storeRef = {
              name: playingRef.current.name,
              album: playingRef.current.album,
              image: playingRef.current.image,
            }
            setRecentlyPlayedTracks((prev) => {
              // if (playingRef.current){
              const updatedList = [...prev, storeRef ];
              return updatedList.slice(-maxTracks.current);
              // }
              // return prev
            });
          }

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
      
      for (let i = 0; i < recentlyPlayed.items.length && tracksArray.length < maxTracks.current; i ++) {
        const track = recentlyPlayed.items[i]
        const t = {
          name: track.track.name,
          image: track.track.album.images[0].url,
          album: track.track.album.name,
        }

        tracksArray.unshift(t)
      }

      setRecentlyPlayedTracks(tracksArray)

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
    <div className="flex flex-col items-center  gap-5 ">
      <div className="relative w-full" style={{height: `${cdRem}rem`}}>
        {recentlyPlayedTracks.map((track, index) => (
          <CD imageSrc={track.image} name={track.name} key={index} isSpinning={false} size={cdRem} className={'absolute z-10'} style={{
            left: `calc(50% - ${(maxTracks.current - index + 1) * cdRem/2}rem)`,
            transform: `scale(${1 - ((maxTracks.current - index) * scaleFactor)})`
          }}/>
        ))}
        <CD imageSrc={currentTrack.image} name={currentTrack.name} isSpinning={isPlaying} className={'absolute z-50'} style={{left: `calc(50% - ${cdRem/2}rem)`}} size={cdRem}/>
        {trackQueue.map((track, index) => (
          <CD imageSrc={track.image} name={track.name} key={index} isSpinning={false} size={cdRem} className={'absolute '} style={{
            left: `calc(50% + ${(index) * cdRem/2}rem)`,
            transform: `scale(${1 - ((index + 1) * scaleFactor)})`,
            zIndex: `${(maxTracks.current - index)}`
          }}/>
        ))}
        
      </div>
      <Playback isPlaying={isPlaying} trackName={currentTrack.name} artist={currentArtist} playButtonPressed={playButtonPressed}/>
    </div>
  )
}