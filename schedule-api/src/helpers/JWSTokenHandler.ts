import * as jws from 'jws';

export class JWSTokenHandler {
    private JWS_SECRET = 'test12344321';

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
