import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/login";
import { authorizeSpotify } from "~/util/SpotifyUtils";
import { useNavigate, useLocation } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Connect Spotify" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

export default function Home() {
  const authUrl = useRef<string | null>(null)

  async function authorize() {
    authUrl.current = await authorizeSpotify(clientId)
  }

  useEffect(() => {
    authorize()
  }, [])

  

  return (<div className="flex justify-center">
    <div className="bg-gray-900 rounded-xl mt-44 p-5 shadow-lg w-52 flex flex-col items-center gap-5">
      <h1 className="font-bold text-4xl">CD Player</h1>
      <p className="text-center w-40"> You need to connect to spotify for the player to work </p>
      <button
        className="bg-green-500 rounded-md p-2 font-bold text-lg mt-5"
        type="button"
        onClick={() => {
          if (authUrl.current) {
            window.location.href = authUrl.current
          }
        }}
      >Connect Spotify</button>
    </div>
  </div>);
}
