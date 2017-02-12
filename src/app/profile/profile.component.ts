import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Router } from '@angular/router';

@Component({
    selector: 'profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.css'],
    providers: [ProfileService]
})
export class ProfileComponent implements OnInit {
    _userInfo: Array<Object>;
    _error: boolean = false;
    addressExist: boolean = true;

    constructor(
        private profileService: ProfileService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getProfile()
    }
    // get initial data to populate form
    getProfile(){
        this.profileService.getUserProfile()
            .subscribe(response => {
                if (!response[0].address) this.addressExist = false; //to trigger ngif 'add address' 
                else this.addressExist = true;
                this._userInfo = response;
            },
            error => {
                if (error) this.router.navigate(['user/cart'])
            });
    }
    userSubmit(givenName, fullName, address, city, state, zip){
        if (givenName && fullName && address && city && state && zip) {
            this.profileService.updateUserProfile(givenName, fullName, address, city, state, zip)
                .subscribe(response => {
                    if (response) location.reload();
                },
                error => {
                    this._error = true;
                });
        }
    }
}