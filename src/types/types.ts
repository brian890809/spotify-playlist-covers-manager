// src/types/types.ts

/**
 * Represents an image object, typically used for cover art or profile pictures.
 */
export interface Image {
    url: string;
    height: number | null;
    width: number | null;
}

/**
 * Represents the structure of track information within a playlist item.
 */
export interface PlaylistTrackInfo {
    album: {
        album_type: string;
        artists: any[]; // Consider defining a specific Artist interface if needed
        available_markets: string[];
        external_urls: { spotify: string };
        href: string;
        id: string;
        images: Image[];
        name: string;
        release_date: string;
        release_date_precision: string;
        total_tracks: number;
        type: 'album';
        uri: string;
    };
    artists: any[]; // Consider defining a specific Artist interface if needed
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: { isrc: string };
    external_urls: { spotify: string };
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: 'track';
    uri: string;
}

/**
 * Represents an item within a playlist's track list.
 */
export interface PlaylistTrack {
    added_at: string; // ISO 8601 timestamp
    added_by: {
        external_urls: { spotify: string };
        href: string;
        id: string;
        type: 'user';
        uri: string;
    } | null;
    is_local: boolean;
    primary_color: string | null;
    track: PlaylistTrackInfo | null; // Track object can be null for removed tracks
    video_thumbnail: { url: string | null };
}

/**
 * Represents a Spotify playlist.
 */
export interface Playlist {
    collaborative: boolean;
    description: string | null;
    external_urls: { spotify: string };
    followers?: { href: string | null; total: number }; // Optional based on endpoint
    href: string;
    id: string;
    images: Image[];
    name: string;
    owner: {
        display_name?: string; // Sometimes null
        external_urls: { spotify: string };
        href: string;
        id: string;
        type: 'user';
        uri: string;
    };
    primary_color: string | null;
    public: boolean | null;
    snapshot_id: string;
    tracks: {
        href: string;
        items: PlaylistTrack[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    };
    type: 'playlist';
    uri: string;
}

/**
 * Represents a Spotify user's profile information.
 */
export interface UserProfile {
    country?: string; // Optional based on scope
    display_name: string | null;
    email?: string; // Optional based on scope
    explicit_content?: { // Optional based on scope
        filter_enabled: boolean;
        filter_locked: boolean;
    };
    external_urls: { spotify: string };
    followers: { href: string | null; total: number };
    href: string;
    id: string;
    images: Image[];
    product?: string; // Optional based on scope
    type: 'user';
    uri: string;
}

/**
 * Represents the structure of the Spotify API response for fetching multiple playlists.
 */
export interface PlaylistsResponse {
    href: string;
    items: Playlist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}

/**
 * Represents the structure for access token response.
 */
export interface TokenResponse {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token?: string; // Included when requesting offline access
        scope?: string; // Included if scopes were requested
}

/**
 * Represents the structure for API error responses.
 */
export interface ApiError {
        status: number;
        message: string;
}

/**
 * Represents the structure for Spotify API error responses.
 */
export interface SpotifyApiError {
    error: ApiError;
}


/**
 * Represents the structure of an API key entry.
 */
export interface ApiKeyEntry {
    id: string;
    llmType: string;
    apiKey: string;
}