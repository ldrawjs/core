export function write(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function read(key: string) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : raw;
}
