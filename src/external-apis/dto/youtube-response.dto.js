"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeSearchResponseDto = exports.YoutubeItemDto = void 0;
const openapi = require("@nestjs/swagger");
class YoutubeItemDto {
    title;
    videoId;
    embedUrl;
    thumbnailUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String }, videoId: { required: true, type: () => String }, embedUrl: { required: true, type: () => String }, thumbnailUrl: { required: true, type: () => String } };
    }
}
exports.YoutubeItemDto = YoutubeItemDto;
class YoutubeSearchResponseDto {
    results;
    nextPageToken;
    prevPageToken;
    static _OPENAPI_METADATA_FACTORY() {
        return { results: { required: true, type: () => [require("./youtube-response.dto").YoutubeItemDto] }, nextPageToken: { required: false, type: () => String }, prevPageToken: { required: false, type: () => String } };
    }
}
exports.YoutubeSearchResponseDto = YoutubeSearchResponseDto;
//# sourceMappingURL=youtube-response.dto.js.map