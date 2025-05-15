import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OtpService {
    constructor() { }

    private readonly OTP_EXPIRATION = 300;
    private tokenStore: Map<string, string> = new Map(); // Lưu token theo email (hoặc key khác)

    // Set token
    async setToken(email: string, token: string) {
        // console.log(token);
        const tokenSet = await this.tokenStore.set(email, token);
        // console.log(tokenSet)
        return tokenSet;
    }

    // Get token
    async getToken(email: string) {
        // console.log("Token Store: " + this.tokenStore)
        // console.log("Token get: " + this.tokenStore.get("quangtienngo661@gmail.com"))
        // console.log("Token values: " + this.tokenStore.values())
        // for (const value of this.tokenStore.values()) {
        //     console.log(value); // In ra: value1, value2, value3
        // }
        return await this.tokenStore.get(email) || null;
    }

    // Clear token
    async clearToken(email: string) {
        return await this.tokenStore.delete(email);
    }

    async generateOtpToken(email: string) {
        const otp = crypto.randomInt(100000, 999999).toString();
        const secretKey = process.env.JWT_SECRET;

        if (!secretKey) {
            throw new Error("JWT_SECRET is not set")
        }

        const token = await jwt.sign(
            {
                otp,
                email,
            },
            secretKey,
            { expiresIn: '5m' }
        );
        await this.setToken(email, token);

        return token;
    }

    async decodeOtpToken(token: string) {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("JWT_SECRET is not set")
        }
        return await jwt.verify(token, secretKey) as { otp: string };
    }



    async verifyOtpToken(token: string, inputOtp: string) {
        try {
            const decoded = await this.decodeOtpToken(token)
            return await decoded.otp === inputOtp; // So khớp OTP
        } catch (error) {
            throw new Error('The OTP Code is invalid or expired');
        }
    }
}
