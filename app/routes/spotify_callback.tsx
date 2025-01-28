import { useEffect, useRef } from "react";
import type { Route } from "./+types/spotify_callback";
import { useNavigate } from "react-router";
import { getAccessCode, handleAccessTokenResponse } from "~/util/SpotifyUtils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "callback" },
    { name: "description", content: "cd player" },
  ];
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

export default function Spotify_Callback() {
  const navigate = useNavigate()  

  

  const hasRun = useRef(false)

  async function init() {
    const qString = window.location.search;
    const urlSearch = new URLSearchParams(qString);
    const code = urlSearch.get("code");

    if (code && !hasRun.current) {
      hasRun.current = true

      const response = await getAccessCode(clientId, code)
      if (response) {
        handleAccessTokenResponse(response)
      }
      
      navigate("/player")
      hasRun.current = false
    }

  }

  useEffect(() => {
    init()
  }, [])

  return (
      <div/>
  )
}
