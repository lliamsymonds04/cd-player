import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
    index("routes/login.tsx"),
    route("/player", "routes/player.tsx"),
    // route("/spotify_callback/{result}", "routes/spotify_callback.tsx")
    ...prefix("spotify_callback", [index("routes/spotify_callback.tsx")])
] satisfies RouteConfig;
