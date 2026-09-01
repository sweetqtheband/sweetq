/**
 * Edge Runtime compatible authentication
 * Safe to use in middleware and other Edge environments
 */

/**
 * Decodes JWT without verifying signature (safe for middleware)
 * Signature verification happens on backend
 */
const decodeJWT = (token: string): Record<string, any> | null => {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        // Decode payload (second part)
        const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
        );
        return payload;
    } catch {
        return null;
    }
};

/**
 * Checks if JWT token is expired
 */
const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
};

export const AuthEdge = {
    /**
     * Validates auth with JWT expiration check (Edge-compatible)
     * No external calls, only local validation
     */
    isAuthBasic(params: {
        user: Record<string, any> | { value: string } | string | null;
        token: { value: string } | string | null;
    }): boolean {
        const { user, token } = params;

        // Extract values if they're cookie objects
        const userData =
            typeof user === "string"
                ? user
                : user && "value" in user
                    ? user.value
                    : typeof user === "object"
                        ? JSON.stringify(user)
                        : null;

        const tokenValue =
            typeof token === "string"
                ? token
                : token && "value" in token
                    ? token.value
                    : null;

        // Basic validation
        if (!userData || !tokenValue) {
            return false;
        }

        try {
            // Verify they're valid JSON
            if (typeof userData === "string") {
                JSON.parse(userData);
            }

            // Validate JWT structure and expiration
            if (typeof tokenValue === "string") {
                if (isTokenExpired(tokenValue)) {
                    return false;
                }
            }
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Optional: Validate token against backend using fetch (Edge-compatible)
     * Returns true if valid, false if invalid or expired
     */
    async isAuthRemote(params: {
        token: string;
    }): Promise<boolean> {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URI}/auth`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${params.token}`,
                    },
                }
            );

            return response.status === 200;
        } catch {
            return false;
        }
    },
};
