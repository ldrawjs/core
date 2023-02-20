export default class ParserContext {
    bfcCertified = false;
    bfcCCW = true;
    bfcInverted = false;
    bfcCull = true;
    startingBuildingStep = false;

    get doubleSided(): boolean {
        return !this.bfcCertified || !this.bfcCull;
    }
}
