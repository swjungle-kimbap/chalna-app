export type friend = {
    id: number,
    message?: string | null,
    username: string,
}

export type friendAPIResponse = {
    status: number;
    message: string;
    data: friend[];
}
