import { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/login";
import { authorizeSpotify } from "~/util/SpotifyUtils";
import { useNavigate, useLocation } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
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

  

  return (<div>
    <button
      type="button"
      onClick={() => {
        if (authUrl.current) {
          // navigate(authUrl.current)
          window.location.href = authUrl.current

        }
      }}
    >Auth</button>
  </div>);
}
