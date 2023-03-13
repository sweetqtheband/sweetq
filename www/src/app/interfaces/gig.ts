import {Band} from "./band";
export interface Gig {
    id: number,
    date: string,
    city: string,
    hour: string,
    venue: string,
    bands: Band[],
    event: string,
    tickets: string;
    expired?: boolean
}