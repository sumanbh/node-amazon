import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class OrderDetailsService {

    constructor(
        private http: Http
    ) { }

    getOrdersById(id: number){
        const ordersUrl = `/api/user/order/${id}`;  //api url
        return this.http.get(ordersUrl)
            .map((res: Response) => res.json());
    }
}