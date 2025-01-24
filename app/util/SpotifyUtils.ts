const scope = 'user-read-private user-read-email user-read-recently-played user-read-playback-state';

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

const redirectUri = 'http://localhost:5173/spotify_callback';



export async function authorizeSpotify(clientId: string) {
    const codeVerifier  = generateRandomString(64);

    console.log(`auth code verififer ${codeVerifier}`)

    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    const params =  {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
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
            ["redirect_uri", redirectUri],
            ["code_verifier", codeVerifier]
        ]),
    }
    
    const body = await fetch("https://accounts.spotify.com/api/token", payload);
    const response = await body.json();

    return response
}

export async function getRecentlyPlayed(access_code: string, limit: number) {
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