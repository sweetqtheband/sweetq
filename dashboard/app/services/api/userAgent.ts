import UserAgent from 'user-agents';
import { UAParser } from 'ua-parser-js';

/**
 * UA Client Hints data structure
 */
export interface UAClientHintsData {
    architecture?: string;
    bitness?: string;
    brands?: Array<{ brand: string; version: string }>;
    formFactor?: string[];
    fullVersionList?: Array<{ brand: string; version: string }>;
    mobile?: boolean;
    model?: string;
    platform?: string;
    platformVersion?: string;
    wow64?: boolean;
}

/**
 * User Agent response structure
 */
export interface UserAgentData {
    ua: string;
    chData: UAClientHintsData;
}

/**
 * User Agent Service
 * Provides randomized user agent generation for fetch headers and puppeteer
 */
export const userAgentSvc = {
    /**
     * Parse UA client hints from UAParser result
     */
    parseUAClientHints(uap: any): UAClientHintsData {
        const ch: UAClientHintsData = {};

        // Parse architecture and bitness
        const arch = /(x86|arm).*(64)/.exec(uap.cpu.architecture || '');
        if (arch) {
            ch.architecture = arch[1];
            if (arch[2] === '64') {
                ch.bitness = '64';
            }
        }

        // Parse device type
        switch (uap.device.type) {
            case 'mobile':
                ch.formFactor = ['Mobile'];
                ch.mobile = true;
                break;
            case 'tablet':
                ch.formFactor = ['Tablet'];
                ch.mobile = false;
                break;
            default:
                ch.mobile = false;
        }

        // Parse device model
        if (uap.device.model) {
            ch.model = uap.device.model;
        }

        // Parse OS/Platform
        if (uap.os.name) {
            ch.platform = uap.os.name;
            if (uap.os.version) {
                ch.platformVersion = uap.os.version;
            }
        }

        // Parse browser/brands
        if (uap.browser.name) {
            const brands = [
                { brand: uap.browser.name, version: uap.browser.version || '' },
            ];
            ch.brands = brands;
            ch.fullVersionList = brands;
        }

        return ch;
    },

    /**
     * Normalize and set default values for chData
     */
    normalizeChData(chData: UAClientHintsData): UAClientHintsData {
        // Random architecture (ARM or x64)
        chData.architecture = Math.random() < 0.5 ? 'ARM' : 'x64';

        // Set mandatory defaults
        chData.platform = chData.platform || 'Windows';
        chData.platformVersion = chData.platformVersion || '10.0.0';
        chData.mobile =
            typeof chData.mobile === 'boolean' ? chData.mobile : false;
        chData.model = chData.model || '';

        // Ensure brands array
        if (
            !chData.brands ||
            !Array.isArray(chData.brands) ||
            chData.brands.length === 0
        ) {
            chData.brands = [
                { brand: 'Chromium', version: '126' },
                { brand: 'Google Chrome', version: '126' },
            ];
        }

        // Ensure fullVersionList array
        if (
            !chData.fullVersionList ||
            !Array.isArray(chData.fullVersionList) ||
            chData.fullVersionList.length === 0
        ) {
            chData.fullVersionList = [
                { brand: 'Chromium', version: '126.0.6478.54' },
                { brand: 'Google Chrome', version: '126.0.6478.54' },
            ];
        }

        return chData;
    },

    /**
     * Generate a random user agent with client hints data
     */
    generate(): UserAgentData {
        const userAgent = new UserAgent();
        const ua = userAgent.toString();
        const uap = new UAParser(ua).getResult();

        let chData = this.parseUAClientHints(uap);
        chData = this.normalizeChData(chData);

        return {
            ua,
            chData,
        };
    },

    /**
     * Get user agent for fetch headers
     * @returns Object with headers ready to use in fetch
     */
    getForFetch(): { 'User-Agent': string } {
        const { ua } = this.generate();
        return {
            'User-Agent': ua,
        };
    },

    /**
     * Get user agent for puppeteer with chData
     * Can be used directly in page.setUserAgent(ua, chData)
     */
    getForPuppeteer(): UserAgentData {
        return this.generate();
    },

    /**
     * Convert chData to HTTP headers for fetch (Sec-CH-UA-* headers)
     */
    toHeaders(chData: UAClientHintsData): Record<string, string> {
        const headers: Record<string, string> = {};

        if (chData.architecture) {
            headers['Sec-CH-UA-Arch'] = `"${chData.architecture}"`;
        }

        if (chData.bitness) {
            headers['Sec-CH-UA-Bitness'] = `"${chData.bitness}"`;
        }

        if (chData.brands && Array.isArray(chData.brands)) {
            const brandsList = chData.brands
                .map((b) => `"${b.brand}";v="${b.version}"`)
                .join(', ');
            headers['Sec-CH-UA'] = brandsList;
        }

        if (chData.formFactor && Array.isArray(chData.formFactor)) {
            headers['Sec-CH-UA-Form-Factor'] = chData.formFactor
                .map((f) => `"${f}"`)
                .join(', ');
        }

        if (chData.fullVersionList && Array.isArray(chData.fullVersionList)) {
            const versionList = chData.fullVersionList
                .map((v) => `"${v.brand}";v="${v.version}"`)
                .join(', ');
            headers['Sec-CH-UA-Full-Version-List'] = versionList;
        }

        if (typeof chData.mobile === 'boolean') {
            headers['Sec-CH-UA-Mobile'] = chData.mobile ? '?1' : '?0';
        }

        if (chData.model) {
            headers['Sec-CH-UA-Model'] = `"${chData.model}"`;
        }

        if (chData.platform) {
            headers['Sec-CH-UA-Platform'] = `"${chData.platform}"`;
        }

        if (chData.platformVersion) {
            headers['Sec-CH-UA-Platform-Version'] = `"${chData.platformVersion}"`;
        }

        if (typeof chData.wow64 === 'boolean') {
            headers['Sec-CH-UA-WOW64'] = chData.wow64 ? '?1' : '?0';
        }

        return headers;
    },

    /**
     * Get complete fetch options with user agent and client hints
     */
    getCompleteFetchHeaders(): Record<string, string> {
        const { ua, chData } = this.generate();
        return {
            'User-Agent': ua,
            ...this.toHeaders(chData),
        };
    },
};
