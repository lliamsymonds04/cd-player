import { useEffect } from "react";
import type { Route } from "./+types/spotify_callback";
import { useNavigate } from "react-router";
import { getAccessCode } from "~/util/SpotifyUtils";
import { access } from "fs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "callback" },
    { name: "description", content: "cd player" },
  ];
}

export default function Spotify_Callback() {
  const navigate = useNavigate()  

  const qString = window.location.search;
  const urlSearch = new URLSearchParams(qString);
  const code = urlSearch.get("code");

  console.log(code)

  async function acccess() {
    if (code) {
      const accessCode = await getAccessCode(code)

      localStorage.setItem("spotify_access_code", accessCode)
      
      navigate("/player")
    }

  }

  useEffect(() => {
    access
  }, [code])

  return (
      <div>
          <h1>IT WORKED</h1>
      </div>
  )
}
