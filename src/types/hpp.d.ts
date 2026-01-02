declare module 'hpp' {
  import { RequestHandler } from 'express';

  // HPP eksportuoja funkciją, kuri grąžina Express middleware
  const hpp: () => RequestHandler;

  export default hpp;
}
