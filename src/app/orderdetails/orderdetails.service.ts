import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class OrderDetailsService {

    constructor(
        private http: Http
    ) { }

    getOrdersById(){
        const ordersUrl = `api/user/orders`;  //api url
        return this.http.get(ordersUrl)
            .map((res: Response) => res.json());
    }
}