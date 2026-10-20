import { AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';

export function makeAxiosResponse<T>(data: T, status = 200): AxiosResponse<T> {
    return {
        data,
        status,
        statusText: status === 200 ? 'OK' : '',
        headers: {},
        config: {
            headers: new AxiosHeaders(),
        },
    };
}
