import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PayLoadType } from "../payload.type";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){ // default name is 'jwt'
    constructor(private readonly configService: ConfigService) { // inject configService to get JWT_SECRET
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get("JWT_SECRET") ?? "", // get secret from configService
        });
    } // jwtFromRequest bearer token, ignoreExpiration false, secretOrKey from configService in strategy

    async validate(payload: PayLoadType) {
        return {
            userId: payload.userId,
            email: payload.email,
            adminSecret: payload.adminSecret // for role based but maybe not gonna use
        }
    }
}