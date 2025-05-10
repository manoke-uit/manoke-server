export declare class YoutubeItemDto {
    title: string;
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
}
export declare class YoutubeSearchResponseDto {
    results: YoutubeItemDto[];
    nextPageToken?: string;
    prevPageToken?: string;
}
