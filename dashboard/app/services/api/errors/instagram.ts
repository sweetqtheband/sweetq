interface IGErrorType {
    code: number;
    message: string;
    request?: any;
    response?: {
        data?: {
            error?: {
                code: number;
                message: string;
            };
        };
    };
}

const INSTAGRAM_ERROR_CODES = {
    INVALID_ACCESS_TOKEN: 190,
    RATE_LIMIT: 613,
    UNKNOWN: 1,
};

const isExpired = (error: IGErrorType) => error.response?.data?.error?.code === INSTAGRAM_ERROR_CODES.INVALID_ACCESS_TOKEN;

const IGError = {
    ERROR_CODES: INSTAGRAM_ERROR_CODES,
    isExpired,
};

export default IGError;
export type { IGErrorType };
