import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    constructor(private configService : ConfigService, private authService : AuthService){
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
            scope: ['email', 'profile'],
        });
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ){
        console.log('Google profile:', profile);
        const user = await this.authService.validateGoogleUser({
            displayName: profile.displayName || "",
            email: profile.email || "",
            imageUrl: profile.picture || "",
            password: profile.id || "", // Use Google ID as password for simplicity});
        });
        if(!user){
            return done(new Error("User not found"), false);
        }
        else return done("", user);
    }
    
}