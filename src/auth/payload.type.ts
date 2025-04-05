export interface PayLoadType{
    email: string;
    userId: number;
    adminSecret?: string; // for role based but maybe not gonna use
}

export type Enable2FAType = {
    secret: string;
};