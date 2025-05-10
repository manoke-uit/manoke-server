import { IBackendRes } from 'src/interfaces/backend.interface';
export declare const responseHelper: <T>({ data, message, error, statusCode, }: {
    data?: T;
    message?: string;
    error?: string | string[];
    statusCode?: number | string;
}) => IBackendRes<T>;
