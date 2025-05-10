export class YoutubeItemDto {
    title: string;
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
}

export class YoutubeSearchResponseDto {
    results: YoutubeItemDto[];
    nextPageToken?: string;
    prevPageToken?: string;
}