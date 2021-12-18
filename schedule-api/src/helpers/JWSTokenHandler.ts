import * as jws from 'jws';
const dotenv = require("dotenv");
dotenv.config();

export class JWSTokenHandler {
    private JWS_SECRET = process.env.JWT_TOKEN_SECRET;
    signToken = (payload: string) => {
        return jws.sign({
            header: { alg: 'HS256' },
            payload,
            secret: this.JWS_SECRET
        });
    }

    decode = (signatureToken: string) => {
        return jws.decode(signatureToken);
    }
}
