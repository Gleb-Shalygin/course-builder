import { AxiosError } from 'axios';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';

export function makeAxiosError(data: unknown, status = 422): AxiosError {
    return new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, undefined, undefined, makeAxiosResponse(data, status));
}
