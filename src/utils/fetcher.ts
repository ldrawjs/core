import type { LDrawJson } from '../types';
// temporary impl.
import { read, write } from './storage';


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
    const text = read(part);
    if (!text) {
        const t = await Promise.any([`${URL}/p/${part}`, `${URL}/parts/${part}`].map(loadOrTrows));
        write(part, t);
    }
    return read(part) as LDrawJson;
}
