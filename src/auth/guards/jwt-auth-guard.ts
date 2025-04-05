import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
// The @Injectable() decorator marks the class as a provider that can be injected into other classes.

export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }

    // just need to export class extends AuthGuard('jwt')
}
// This guard uses the JWT strategy to authenticate requests. It checks for a valid JWT token in the request headers and validates it using the JwtStrategy class. If the token is valid, the request is allowed to proceed; otherwise, an error is thrown.