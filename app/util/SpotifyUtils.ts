const scope = 'user-read-private user-read-email';
const url = 'https://accounts.spotify.com/api/token'

function generateRandomString (length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
  

async function sha256 (plain: string)  {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return crypto.subtle.digest('SHA-256', data)
}

function base64encode(input: ArrayBuffer)  {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
}

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = 'http://localhost:5173/spotify_callback';

const codeVerifier  = generateRandomString(64);


export async function authorizeSpotify() {
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

    return authUrl.toString()   
}

export async function getAccessCode(code: string) {
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
    
    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('spotify_access_token', response.access_token);
    return response.access_token
}

export async function getRecentlyPlayed(access_code: string, limit: number) {
    const payload = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${access_code}`,
        },
        body: new URLSearchParams([
            ["limit", String(limit)]
        ]),
    }

    const body = await fetch(url, payload)
    const response = await body.json()

    return response
}