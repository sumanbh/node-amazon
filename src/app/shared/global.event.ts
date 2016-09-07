import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class GlobalEvent {
    public showLogin: EventEmitter<any> = new EventEmitter();

    constructor() {

    }
}