/**
 * Facebook JavaScript SDK type declarations
 */

interface Window {
    FB: {
        init: (config: {
            appId: string;
            cookie?: boolean;
            xfbml?: boolean;
            version: string;
        }) => void;
        login: (
            callback: (response: any) => void,
            options?: {
                scope?: string;
                return_scopes?: boolean;
            }
        ) => void;
        getLoginStatus: (callback: (response: any) => void) => void;
    };
}

declare function FBLogin(): void;

