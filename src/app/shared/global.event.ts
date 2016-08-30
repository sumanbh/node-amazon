import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class GlobalEvent {
    public showLogin: EventEmitter<boolean> = new EventEmitter();

    constructor() {

    }
}