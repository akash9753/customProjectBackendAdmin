import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import config from "config";
console.log(config.get("secret.secretkey"));



export class TokenService {
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        if (!config.get("secret.secretkey")) {
            const error = createHttpError(500, "SECRET_KEY is not set");
            throw error;
        }
        try {
            privateKey = config.get("secret.secretkey");
        } catch (err) {
            const error = createHttpError(
                500,
                "Error while reading private key",
            );
            throw error;
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });

        return accessToken;
    }

    
}