import PusherServer from 'pusher';
import PusherClient from 'pusher-js';
import { getEnvOrThrow } from './env';

function createPusherServer(): PusherServer {
  if (typeof window !== 'undefined') {
    throw new Error('PusherServer should not be instantiated on the client');
  }
  return new PusherServer({
    appId: getEnvOrThrow('PUSHER_APP_ID'),
    key: getEnvOrThrow('NEXT_PUBLIC_PUSHER_KEY'),
    secret: getEnvOrThrow('PUSHER_SECRET'),
    cluster: getEnvOrThrow('NEXT_PUBLIC_PUSHER_CLUSTER'),
    useTLS: true,
  });
}

let _pusherServer: PusherServer | undefined;

export function getPusherServer(): PusherServer {
  if (!_pusherServer) {
    _pusherServer = createPusherServer();
  }
  return _pusherServer;
}

function createPusherClient(): PusherClient {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) {
    throw new Error(
      `Missing required environment variable: ${!key ? 'NEXT_PUBLIC_PUSHER_KEY' : 'NEXT_PUBLIC_PUSHER_CLUSTER'}. ` +
        'Check your .env file or Vercel Environment Variables.'
    )
  }
  return new PusherClient(key, { cluster })
}

let _pusherClient: PusherClient | undefined;

export function getPusherClient(): PusherClient {
  if (!_pusherClient) {
    _pusherClient = createPusherClient();
  }
  return _pusherClient;
}
