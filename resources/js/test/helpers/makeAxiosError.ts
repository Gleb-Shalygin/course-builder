import { AxiosError } from 'axios';
import { makeAxiosResponse } from '@/test/helpers/makeAxiosResponse';

export function makeAxiosError<T>(data: T, status = 422): AxiosError<T> {
    return new AxiosError('Request failed', AxiosError.ERR_BAD_REQUEST, undefined, undefined, makeAxiosResponse(data, status));
}
