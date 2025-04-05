import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { PayLoadType } from "../payload.type";
import { ConfigService } from "@nestjs/config";

export class JwtAdminGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }
    handleRequest<TUser = PayLoadType>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        console.log(user); // for debug
        
        if(user.adminSecret) return user;
        throw err || new UnauthorizedException('User is not admin'); // If user is not an artist, throw an error
    }
}