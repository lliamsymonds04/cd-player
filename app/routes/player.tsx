import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/player";
import { getPlaying, getRecentlyPlayed } from "~/util/SpotifyUtils";
import CD from "~/components/CD";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "player" },
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
  const [tracks, setTracks] = useState<Track[]>([])
  const maxTracks = useRef(5)

  const [playingIndex, setPlayingIndex] = useState<number | null>()

  

  function addTrack(t: Track) {
    if (findTrackIndex(t, tracks) == null) {
      setTracks([t, ...tracks.splice(0, maxTracks.current-2)])
    }
  }

  async function handlePlaying() {
    if (accessToken.current) {
      const currentlyPlaying = await getPlaying(accessToken.current)

      let newPlayingIndex = null
      if (currentlyPlaying) {
        //check the first track isnt the current track
        const playingTrack = {
          name: currentlyPlaying.item.name,
          image: currentlyPlaying.item.album.images[0].url,
          album: currentlyPlaying.item.album.name
        }

        let disc_index = findTrackIndex(playingTrack, tracks)
        
        if (disc_index) {
          // newPlayingIndex = disc_index
        } else { //add the track to the front
          // console.log([playingTrack, ...tracks.splice(0, maxTracks.current-2)])
          // setTracks([playingTrack, ...tracks.splice(0, maxTracks.current-2)])
          setTracks((prevTracks) => [playingTrack, ...prevTracks.splice(0, maxTracks.current-2)])
          // newPlayingIndex = 0
          disc_index = 0
        }

        if (currentlyPlaying.is_playing) {
          newPlayingIndex = disc_index
        }
      } else {
        
      }

      setPlayingIndex(newPlayingIndex)
    }

     
  }

  async function init() {
    if (accessToken.current) {
      return
    }
    accessToken.current = localStorage.getItem("spotify_access_token")
    console.log(`player access token ${accessToken.current}`)

    if (accessToken.current) {
      const recentlyPlayed = await getRecentlyPlayed(accessToken.current, 4)

      let tracksArray: Track[] = []
      

      //add recently played
      let albumNames: string[] = []
      let i = 0
      while (i < recentlyPlayed.items.length && tracksArray.length < maxTracks.current - 1) {
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

      //add the next song as the last item

      setTracks(tracksArray)

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
    <div className="flex flex-row items-center mt-10 gap-5 align-bottom justify-center">
      {tracks.map((track, index) => (
        <CD imageSrc={track.image} name={track.name} key={index} size={32} isSpinning={index == playingIndex}/>
      ))}
    </div>
  )
}
