import { useEffect, useRef } from "react";
import type { Route } from "./+types/player";
import { getRecentlyPlayed } from "~/util/SpotifyUtils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "player" },
    { name: "description", content: "cd player" },
  ];
}

export default function Player() {
  const accessCode = useRef<string | null>(null)

  async function init() {
    accessCode.current = localStorage.getItem("spotify_access_code")
    console.log(accessCode.current)

    if (accessCode.current) {
      const recentlyPlayed = await getRecentlyPlayed(accessCode.current, 5)

      console.log(recentlyPlayed)
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div>
        <h1>IT WORKED</h1>
    </div>
  )
}
