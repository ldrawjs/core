import type {
    LDrawLineLine,
    LDrawOptLine,
    LDrawPartLine,
    LDrawQuadLine,
    LDrawTriLine,
    LineLine,
    MetaLine,
    OptLine,
    PartLine,
    QuadLine,
    TriLine
} from '../types';
import { Matrix4, Vector3 } from 'three';
import vectorized from './vectorized';

export default class ParserContext {
    type = '';

    // internal state
    bfcCertified = false;
    bfcCCW = true;
    bfcInverted = false;
    bfcCull = true;
    startingBuildingStep = false;

    get doubleSided(): boolean {
        return !this.bfcCertified || !this.bfcCull;
    }

    meta([_, meta, ...values]: MetaLine) {
        switch (meta) {
            case '!LDRAW_ORG':
                this.type = values[0];
                break;
            case '!COLOUR':
                // todo complete
                break;
            case 'FILE':
                // todo well....
                break;
            case 'BFC':
                // todo simplify
                // update back-face-culling
                for (const token of values) {
                    switch (token) {
                        case 'CERTIFY':
                        case 'NOCERTIFY':
                            this.bfcCertified = token === 'CERTIFY';
                            this.bfcCCW = true;
                            break;
                        case 'CW':
                        case 'CCW':
                            this.bfcCCW = token === 'CCW';
                            break;
                        case 'INVERTNEXT':
                            this.bfcInverted = true;
                            break;
                        case 'CLIP':
                        case 'NOCLIP':
                            this.bfcCull = token === 'CLIP';
                            break;
                    }
                }
                break;
            case 'STEP':
                this.startingBuildingStep = true;
                break;
        }
    }

    part([type, color, posX, posY, posZ, m0, m1, m2, m3, m4, m5, m6, m7, m8, name]: PartLine): LDrawPartLine {
        const part: LDrawPartLine = [
            type,
            color,
            name,
            new Matrix4().set(
                m0, m1, m2, posX,
                m3, m4, m5, posY,
                m6, m7, m8, posZ,
                0, 0, 0, 1
            ),
            [
                this.bfcInverted,
                this.startingBuildingStep
            ]
        ];
        this.startingBuildingStep = false;
        this.bfcInverted = false;
        return part;
    }

    line([type, color, ...n]: LineLine): LDrawLineLine {
        return [type, color, vectorized(...n) as [Vector3, Vector3]];
    }

    optLine([type, color, ...n]: OptLine): LDrawOptLine {
        const [v0, v1, c0, c1] = vectorized(...n);
        return [type, color, [v0, v1], [c0, c1]];
    }

    triangle([type, color, ...n]: TriLine): LDrawTriLine[] {
        const vecs = vectorized(...n);
        const [v0, v1, v2] = this.bfcCCW ? vecs : vecs.reverse();
        if (this.doubleSided) {
            return [
                [type, color, [v0, v1, v2]],
                [type, color, [v2, v1, v0]]
            ];
        }
        return [
            [type, color, [v0, v1, v2]]
        ];
    }

    quad([type, color, ...n]: QuadLine): LDrawQuadLine[] {
        const vecs = vectorized(...n);
        const [v0, v1, v2, v3] = this.bfcCCW ? vecs : vecs.reverse();
        if (this.doubleSided) {
            return [
                [type, color, [v0, v1, v2, v0, v2, v3]],
                [type, color, [v3, v2, v0, v2, v1, v0]]
            ];
        }
        return [
            [type, color, [v0, v1, v2, v0, v2, v3]]
        ];
    }
}
