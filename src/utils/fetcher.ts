import type { LDrawJson } from '../types';

const URL = 'https://raw.githubusercontent.com/ziv/ldr-db/main/l';

const loadOrTrows = async (url: string) => {
    const res = await fetch(url);
    if (res.status !== 200) {
        throw new Error();
    }
    return res.json();
}

export default async function fetcher(part: string): Promise<LDrawJson> {
    part = part.replace('.dat', '.json');
    const text = localStorage.getItem(part);
    if (!text) {
        const t = await Promise.any([`${URL}/p/${part}`, `${URL}/parts/${part}`].map(loadOrTrows));
        localStorage.setItem(part, t);
    }
    return JSON.parse(localStorage.getItem(part) as string) as LDrawJson;
}
