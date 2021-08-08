
export class Card {
    public constructor(
        public order: number,
        public number: EnumCardNumber,
        public suit: EnumCardSuit,
        public image: string,
    ) { }
}

export enum EnumCardSuit {
    heart = 'H',
    diamont = 'D',
    club = 'C',
    spade = 'S',
}

export enum EnumCardNumber {
    cA = 'A',
    c2 = '2',
    c3 = '3',
    c4 = '4',
    c5 = '5',
    c6 = '6',
    c7 = '7',
    c8 = '8',
    c9 = '9',
    c10 = '10',
    cJ = 'J',
    cQ = 'Q',
    cK = 'K',
}