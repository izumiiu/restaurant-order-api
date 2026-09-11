
export const isValidPrice = (p: unknown): p is number => {
    return typeof p === 'number' && Number.isFinite(p) && p > 0;
}

export const isValidMenuname = (m: unknown): m is string => {
    return typeof m === 'string' && m.trim().length > 0;
}