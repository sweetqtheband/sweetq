/**
 * Proxy Service
 * 
 * Gestiona proxies de WebShare.io para uso en fetch y puppeteer
 * Requiere: PROXYLIST_KEY en variables de entorno
 */

export interface ProxyData {
    ip: string;
    username: string;
    password: string;
    proxyAddress?: string;
    port?: number;
}

export interface WebShareProxyResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
        id: number;
        proxy_address: string;
        port: number;
        username: string;
        password: string;
        valid: boolean;
        last_verification: string;
    }>;
}

/**
 * Proxy Service Configuration
 */
interface ProxyServiceConfig {
    apiUrl?: string;
    configUrl?: string;
    pageSize?: number;
    countryCode?: string;
    city?: string;
}

const DEFAULT_CONFIG: ProxyServiceConfig = {
    apiUrl:
        'https://proxy.webshare.io/api/v2/proxy/list/?mode=direct&page=1&page_size=100&country_code__in=ES&search=Madrid',
    configUrl: 'https://proxy.webshare.io/api/v2/proxy/config/',
    pageSize: 100,
    countryCode: 'ES',
    city: 'Madrid',
};

/**
 * Proxy Service
 */
export const proxySvc = {
    proxies: [] as ProxyData[],
    lastFetch: 0,
    cacheTime: 3600000, // 1 hora en ms

    /**
     * Get authorization header
     */
    getAuthHeader(): Record<string, string> {
        const key = process.env.PROXYLIST_KEY;
        if (!key) {
            throw new Error(
                'PROXYLIST_KEY no está configurada en variables de entorno',
            );
        }
        return {
            Authorization: `Token ${key}`,
        };
    },

    /**
     * Fetch proxy list from WebShare API
     */
    async fetchProxyList(config: ProxyServiceConfig = {}): Promise<ProxyData[]> {
        const finalConfig = { ...DEFAULT_CONFIG, ...config };

        try {
            const headers = this.getAuthHeader();

            const response = await fetch(finalConfig.apiUrl!, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error(
                    `Error fetching proxies: ${response.status} ${response.statusText}`,
                );
            }

            const data = (await response.json()) as WebShareProxyResponse;

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error('Invalid proxy list response');
            }

            this.proxies = data.results.map((proxyItem) => ({
                ip: `${proxyItem.proxy_address}:${proxyItem.port}`,
                username: proxyItem.username,
                password: proxyItem.password,
                proxyAddress: proxyItem.proxy_address,
                port: proxyItem.port,
            }));

            this.lastFetch = Date.now();

            console.log(`✅ Loaded ${this.proxies.length} proxies from WebShare`);
            return this.proxies;
        } catch (error) {
            console.error('❌ Error fetching proxy list:', error);
            throw error;
        }
    },

    /**
     * Get cached proxies or fetch new ones
     */
    async getProxyList(config: ProxyServiceConfig = {}): Promise<ProxyData[]> {
        const now = Date.now();

        // Fetch new proxies if cache is empty or expired
        if (this.proxies.length === 0 || now - this.lastFetch > this.cacheTime) {
            await this.fetchProxyList(config);
        }

        return this.proxies;
    },

    /**
     * Get random proxy
     */
    async getProxy(config: ProxyServiceConfig = {}): Promise<ProxyData> {
        const proxies = await this.getProxyList(config);

        if (proxies.length === 0) {
            throw new Error('No proxies available');
        }

        const randomIndex = Math.floor(Math.random() * proxies.length);
        return proxies[randomIndex];
    },

    /**
     * Get proxy for fetch with basic auth
     * Returns proxy URL with credentials embedded
     */
    async getProxyForFetch(
        config: ProxyServiceConfig = {},
    ): Promise<string> {
        const proxy = await this.getProxy(config);
        return `http://${proxy.username}:${proxy.password}@${proxy.ip}`;
    },

    /**
     * Get proxy for puppeteer
     * Returns object with ip, username, and password for page.authenticate()
     */
    async getProxyForPuppeteer(
        config: ProxyServiceConfig = {},
    ): Promise<ProxyData> {
        return this.getProxy(config);
    },

    /**
     * Get proxy credentials for puppeteer authentication
     * Returns only username and password for page.authenticate()
     */
    async getProxyCredentials(
        config: ProxyServiceConfig = {},
    ): Promise<{ username: string; password: string }> {
        const proxy = await this.getProxy(config);
        return {
            username: proxy.username,
            password: proxy.password,
        };
    },

    /**
     * Clear proxy cache
     */
    clearCache(): void {
        this.proxies = [];
        this.lastFetch = 0;
        console.log('Proxy cache cleared');
    },

    /**
     * Verify proxy list is valid
     */
    async verifyProxies(config: ProxyServiceConfig = {}): Promise<boolean> {
        try {
            const key = process.env.PROXYLIST_KEY;
            if (!key) {
                return false;
            }

            const finalConfig = { ...DEFAULT_CONFIG, ...config };
            const headers = { Authorization: `Token ${key}` };

            const response = await fetch(finalConfig.configUrl!, {
                method: 'GET',
                headers,
            });

            return response.ok;
        } catch (error) {
            console.error('Error verifying proxies:', error);
            return false;
        }
    },

    /**
     * Get multiple different proxies
     */
    async getMultipleProxies(
        count: number = 1,
        config: ProxyServiceConfig = {},
    ): Promise<ProxyData[]> {
        const proxies = await this.getProxyList(config);

        if (proxies.length === 0) {
            throw new Error('No proxies available');
        }

        const result: ProxyData[] = [];
        const requested = Math.min(count, proxies.length);

        // Get random unique proxies
        const indices = new Set<number>();
        while (indices.size < requested) {
            indices.add(Math.floor(Math.random() * proxies.length));
        }

        indices.forEach((idx) => result.push(proxies[idx]));
        return result;
    },

    /**
     * Get proxy statistics
     */
    async getStats(): Promise<{
        total: number;
        cached: boolean;
        lastFetch: Date | null;
        cacheAge: number;
    }> {
        return {
            total: this.proxies.length,
            cached: this.proxies.length > 0,
            lastFetch: this.lastFetch > 0 ? new Date(this.lastFetch) : null,
            cacheAge: this.lastFetch > 0 ? Date.now() - this.lastFetch : -1,
        };
    },
};
