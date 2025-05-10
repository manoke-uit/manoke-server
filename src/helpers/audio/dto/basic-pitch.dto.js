"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicPitchDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class BasicPitchDto {
    start;
    end;
    pitch;
    confidence;
    static _OPENAPI_METADATA_FACTORY() {
        return { start: { required: true, type: () => Number }, end: { required: true, type: () => Number }, pitch: { required: true, type: () => Number }, confidence: { required: true, type: () => Number } };
    }
}
exports.BasicPitchDto = BasicPitchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The start time of the note in seconds' }),
    __metadata("design:type", Number)
], BasicPitchDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The end time of the note in seconds' }),
    __metadata("design:type", Number)
], BasicPitchDto.prototype, "end", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The pitch of the note' }),
    __metadata("design:type", Number)
], BasicPitchDto.prototype, "pitch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The confidence level of the pitch detection' }),
    __metadata("design:type", Number)
], BasicPitchDto.prototype, "confidence", void 0);
//# sourceMappingURL=basic-pitch.dto.js.map