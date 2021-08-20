import { Card } from "./cards.model";

export class Player {
    constructor(
        public index: number,
        public cards: Card[]
    ) { }
}