import { Injectable } from "@angular/core";
import { Card, EnumCardBackColor, EnumCardNumber, EnumCardSuit } from "../models/cards.model";
import { EnumGameStatus } from "../models/game.model";
import { GameState } from "../state/reducers/game.reducer";



@Injectable({ providedIn: 'root' })
export class CardsService {

    getDeck(): Card[] {
        let cards: Card[] = [];

        for (const cardBackColor of this.getAllCardBackColors()) {
            for (const cardNumber of this.getAllCardNumbers()) {
                for (const cardSuit of this.getAllCardSuits()) {
                    cards.push(new Card(
                        cardNumber,
                        cardSuit,
                        cardBackColor,
                        EnumCardNumber[cardNumber.toString() as keyof typeof EnumCardNumber] + EnumCardSuit[cardSuit.toString() as keyof typeof EnumCardSuit] + '.svg'
                    ));

                }
            }
        }

        this.shuffle(cards);

        return cards;
    }

    //https://bost.ocks.org/mike/shuffle/
    shuffle(array: Card[]) {
        var currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
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

    private getAllCardBackColors() {
        let cardBackColors: EnumCardBackColor[] = [];
        for (let i = 0; i < Object.keys(EnumCardBackColor).length; i++) {
            const cardBackColor = Object.keys(EnumCardBackColor)[i] as EnumCardBackColor;
            cardBackColors.push(cardBackColor);
        }
        return cardBackColors;
    }

    public canPlayerBuyCard(game: GameState) {
        return game.status == EnumGameStatus.startedPlayerRound
               &&
               game.playerRound == 0
               && game.players.find(p => p.index == 0)?.cards[9] == null;
    }

}

export function areCardsEqual(card1: Card, card2: Card) {
    return card1.backColor === card2.backColor
        &&
        card1.number === card2.number
        &&
        card1.suit === card2.suit

}