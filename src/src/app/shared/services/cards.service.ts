import { Injectable } from "@angular/core";
import { Card, EnumCardNumber, EnumCardSuit } from "../models/cards.model";

@Injectable({ providedIn: 'root' })
export class CardsService {

    getDeck(): Card[] {
        let cards: Card[] = [];

        let index = 0;
        for (const cardNumber of this.getAllCardNumbers()) {
            for (const cardSuit of this.getAllCardSuits()) {
                cards.push(new Card(
                    index,
                    cardNumber,
                    cardSuit,
                    EnumCardNumber[cardNumber.toString() as keyof typeof EnumCardNumber] + EnumCardSuit[cardSuit.toString() as keyof typeof EnumCardSuit] + '.svg'
                ));

            }
            index++;
        }
        return cards;
    }

    private getAllCardNumbers() {
        let cardNumbers: EnumCardNumber[] = [];
        for (let i = 0; i < Object.keys(EnumCardNumber).length; i++) {
            const cardNumber = Object.keys(EnumCardNumber)[i] as EnumCardNumber;

            cardNumbers.push(cardNumber);
        }
        return cardNumbers;
    }

    private getAllCardSuits() {
        let cardSuits: EnumCardSuit[] = [];
        for (let i = 0; i < Object.keys(EnumCardSuit).length; i++) {
            const cardSuit = Object.keys(EnumCardSuit)[i] as EnumCardSuit;
            cardSuits.push(cardSuit);
        }
        return cardSuits;
    }

}