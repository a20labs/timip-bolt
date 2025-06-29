// Type definitions for Supabase Edge Functions (Deno runtime)

declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
    
    export function serve(
      handler: (request: Request) => Response | Promise<Response>
    ): void;
  }
  
  // Make sure Request and Response are available
  interface Request extends globalThis.Request {}
  interface Response extends globalThis.Response {}
}

export {};
