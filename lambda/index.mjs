import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const handler = async () => {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 10; // 10h
  const payload = {
    jti: crypto.randomUUID(),
    iat,
    exp,
    scope: {
      app: {
        id: process.env.SKYWAY_APP_ID,
        turn: true,
        actions: ['read'],
        channels: [
          {
            id: '*',
            name: '*',
            actions: ['write'],
            members: [
              {
                id: '*',
                name: '*',
                actions: ['write'],
                publication: { actions: ['write'] },
                subscription: { actions: ['write'] },
              },
            ],
            sfuBots: [
              {
                actions: ['write'],
                forwardings: [{ actions: ['write'] }],
              },
            ],
          },
        ],
      },
    },
  };
  const token = jwt.sign(payload, process.env.SKYWAY_SECRET_KEY);
  return { token };
};
