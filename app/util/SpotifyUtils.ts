const scope = 'user-read-private user-read-email user-read-recently-played user-read-playback-state user-modify-playback-state user-read-currently-playing';

function generateRandomString (length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
  

async function sha256 (plain: string)  {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

function base64encode(input: ArrayBuffer)  {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
}

// const redirectUri = 'http://localhost:5173/spotify_callback';

function getRedirectUri() {
    const domain = window.location.hostname;
    console.log(domain)

    let base = "http://localhost:5173"
    if (domain == "playcds.netlify.app") {
        base = "https://playcds.netlify.app/"
    }

    return base + "/spotify_callback"
}

export async function authorizeSpotify(clientId: string) {
    const codeVerifier  = generateRandomString(64);

    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: getRedirectUri(),
    }

    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.search = new URLSearchParams(params).toString();
    localStorage.setItem("code_verifier", codeVerifier)


    return authUrl.toString()   
}

export async function getAccessCode(clientId: string, code: string) {
    const codeVerifier = localStorage.getItem("code_verifier")

    if (codeVerifier == null) {
        throw("Code verifier was null")
    }

    console.log(`access code verififer ${codeVerifier}`)
    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams([
            ["client_id", clientId],
            ["grant_type", 'authorization_code'],
            ["code", code],
            ["redirect_uri", getRedirectUri()],
            ["code_verifier", codeVerifier]
        ]),
    }
    
    const body = await fetch("https://accounts.spotify.com/api/token", payload);
    const response = await body.json();

    return response
}

export async function getRecentlyPlayed(access_code: string) {
    const payload = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_code}`,
        },
        
    }

    const body = await fetch(`https://api.spotify.com/v1/me/player/recently-played`, payload) //?limit=${limit}
    const response = await body.json()

    return response
}

export async function getPlaying(access_code: string) {
    const payload = {
        method: "GET",
        headers : {
            'Authorization': `Bearer ${access_code}`,
        }
    }

    const body = await fetch("https://api.spotify.com/v1/me/player", payload)

    if (body.status == 200) { //currently playing
        return await body.json()
    } else {
        //not playing

    }
}

export async function getQueue(access_code: string) {
    const payload = {
        method: "GET",
        headers : {
            'Authorization': `Bearer ${access_code}`,
        }
    }

    const body = await fetch("https://api.spotify.com/v1/me/player/queue", payload)
    if (body.status == 200) { //currently playing
        return await body.json()
    }
}

async function handlePlayback(url: string, method: string) {
    const access_token = localStorage.getItem("spotify_access_token")

    const payload = {
        method: method,
        headers : {
            'Authorization': `Bearer ${access_token}`,
        }
    }

    const response = await fetch(url, payload)
    return response
}

export async function playSpotify() {
    handlePlayback("https://api.spotify.com/v1/me/player/play", "PUT")
}

export async function pauseSpotify() {
    handlePlayback("https://api.spotify.com/v1/me/player/pause", "PUT")
}

export async function skipTrack() {
    handlePlayback("https://api.spotify.com/v1/me/player/next", "POST")
}

export async function previousTrack() {
    handlePlayback("https://api.spotify.com/v1/me/player/previous", "POST")
}

export async function refreshSpotifyToken() {
    const refreshToken = localStorage.getItem("spotify_refresh_token")
    const client_id: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID

    if (refreshToken) {
        const refreshParams = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                // Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
            },
            body: new URLSearchParams([
                ["grant_type", "refresh_token"],
                ["refresh_token", refreshToken],
                ["client_id", client_id]
            ])
        }

        const body = await fetch("https://accounts.spotify.com/api/token", refreshParams)
        const response = await body.json()

        handleAccessTokenResponse(response)
    }
 
    
}

export function handleAccessTokenResponse(response: {[key: string]: any}) {
    const currentTime = new Date().getTime()
    const expireTime = currentTime + (response.expires_in - 60) * 1000

    localStorage.setItem("spotify_access_token", response.access_token)
    localStorage.setItem("spotify_refresh_token", response.refresh_token)
    localStorage.setItem("spotify_token_expire_time", expireTime.toString())
}