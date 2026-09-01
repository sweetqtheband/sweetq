/**
 * Edge Runtime compatible authentication
 * Safe to use in middleware and other Edge environments
 */

export const AuthEdge = {
    /**
     * Validates basic auth structure from cookies (Edge-compatible)
     * Only checks presence and JSON validity, no external calls
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
            if (typeof tokenValue === "string") {
                JSON.parse(tokenValue);
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
