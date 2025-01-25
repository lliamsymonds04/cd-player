import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/player";
import { getPlaying, getRecentlyPlayed, refreshSpotifyToken } from "~/util/SpotifyUtils";
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

function findTrackIndex(track: Track, tracks: Track[]) {
  for (let i = 0; i < tracks.length; i ++) {
    const t = tracks[i]
    if (t.album == track.album) {
      return i
    }
  }

  return null
}


export default function Player() {
  const accessToken = useRef<string | null>(null)
  const tracks = useRef<Track[]>([])
  const maxTracks = useRef(5)
  const lastPlayedIndex = useRef<number | null>(0)
  const isPlayButtonPressed = useRef(false)
  const isRefreshingToken = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>()
  const [currentTrackName, setCurrentTrackName] = useState("")
  const [currentArtist, setCurrentArtist] = useState("")

  async function handlePlaying() {
    const currentTime = new Date().getTime()
    const expireTime = Number(localStorage.getItem("spotify_token_expire_time"))

    if (currentTime > expireTime && !isRefreshingToken.current) {
      isRefreshingToken.current = true
      await refreshSpotifyToken()
      isRefreshingToken.current = false
    }

    if (accessToken.current && !isRefreshingToken.current) {
      const currentlyPlaying = await getPlaying(accessToken.current)

      if (isPlayButtonPressed.current) {
        isPlayButtonPressed.current = false
        return
      }

      let newPlayingIndex = null
      if (currentlyPlaying) {
        //check the first track isnt the current track
        const playingTrack = {
          name: currentlyPlaying.item.name,
          image: currentlyPlaying.item.album.images[0].url,
          album: currentlyPlaying.item.album.name
        }

        let disc_index = findTrackIndex(playingTrack, tracks.current)
        
        if (disc_index == null) {
          tracks.current =  [playingTrack, ...tracks.current.splice(0, maxTracks.current-1)]
          disc_index = 0
        }

        if (currentlyPlaying.is_playing) {
          newPlayingIndex = disc_index
        }

        setIsPlaying(currentlyPlaying.is_playing)
        setCurrentTrackName(playingTrack.name)
        setCurrentArtist(currentlyPlaying.item.album.artists[0].name)
      } else {
        setIsPlaying(false)
      }

      setPlayingIndex(newPlayingIndex)
      
    }

     
  }

  function playButtonPressed(newState: boolean) {
    setIsPlaying(newState)
    isPlayButtonPressed.current = true

    if (newState) {
      setPlayingIndex(lastPlayedIndex.current)
      lastPlayedIndex.current = null
    } else {
      if (playingIndex != null) {
        lastPlayedIndex.current = playingIndex
      }
      setPlayingIndex(null)
    }
  }

  async function init() {
    if (accessToken.current) {
      return
    }
    accessToken.current = localStorage.getItem("spotify_access_token")

    if (accessToken.current) {
      const recentlyPlayed = await getRecentlyPlayed(accessToken.current, 4)

      let tracksArray: Track[] = []
      
      //add recently played
      let albumNames: string[] = []
      let i = 0
      while (i < recentlyPlayed.items.length && tracksArray.length < maxTracks.current) {
        const track = recentlyPlayed.items[i]
        const t = {
          name: track.track.name,
          image: track.track.album.images[0].url,
          album: track.track.album.name,
        }

        if (albumNames.find((v) => (v == t.album)) == undefined) {
          albumNames.push(t.album)
          tracksArray.push(t)
        }

        i += 1
      }
      tracks.current = tracksArray

      const interval = setInterval(() => {
        handlePlaying();
      }, 1000);
  
      return () => clearInterval(interval);   
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="flex flex-col items-center  gap-5 ">
      <div className=" flex flex-row items-center gap-5 justify-center mt-10">
        {tracks.current.map((track, index) => (
          <CD imageSrc={track.image} name={track.name} key={index} isSpinning={index == playingIndex}/>
        ))}
      </div>
      <Playback isPlaying={isPlaying} trackName={currentTrackName} artist={currentArtist} playButtonPressed={playButtonPressed}/>
    </div>
  )
}
