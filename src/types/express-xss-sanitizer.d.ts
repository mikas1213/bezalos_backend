declare module 'express-xss-sanitizer' {
    import { RequestHandler } from 'express';

    export interface XssOptions {
        allowedKeys?: string[];
        maxDepth?: number;
    }

    export function xss(options?: XssOptions): RequestHandler;
}
