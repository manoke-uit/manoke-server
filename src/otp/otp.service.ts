import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OtpService {
    constructor() { }

    private readonly OTP_EXPIRATION = 300;
    private tokenStore: Map<string, string> = new Map(); // Lưu token theo email (hoặc key khác)

    // Set token
    setToken(email: string, token: string): void {
        this.tokenStore.set(email, token);
    }

    // Get token
    getToken(email: string): string | null {
        return this.tokenStore.get(email) || null;
    }

    // Clear token
    clearToken(email: string): void {
        this.tokenStore.delete(email);
    }

    async generateOtpCode(email: string) {
        const otp = crypto.randomInt(100000, 999999).toString();
        const secretKey = process.env.JWT_SECRET;

        if (!secretKey) {
            throw new Error("JWT_SECRET is not set")
        }

        const token = jwt.sign(
            {
                otp,
                email,
            },
            secretKey,
            { expiresIn: '5m' }
        );
        this.setToken(email, token)

        return token;
    }

    decodeOtpToken(token: string) {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("JWT_SECRET is not set")
        }
        return jwt.verify(token, secretKey) as { otp: string };
    }



    verifyOtpToken(token: string, inputOtp: string): boolean {
        try {
            const decoded = this.decodeOtpToken(token)
            return decoded.otp === inputOtp; // So khớp OTP
        } catch (error) {
            throw new Error('The OTP Code is invalid or expired');
        }
    }
}
