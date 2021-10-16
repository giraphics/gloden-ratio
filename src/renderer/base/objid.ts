
let _UUID: number = 1;
export default class UUID {
    id: number;

    constructor() { this.incrementUUID(); }
    static getNextUUID() { return _UUID++; }

    incrementUUID() { this.id = _UUID++; }
}
