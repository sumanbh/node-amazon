import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { User } from './user.interface';

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.scss'],
    providers: [ProfileService]
})
export class ProfileComponent implements OnInit {
    error = false;
    addressExist = true;
    userInfo: Array<Object>;
    userForm: User;

    constructor(
        private profileService: ProfileService,
        private router: Router,
        private titleService: Title,
    ) { }

    ngOnInit() {
        this.titleService.setTitle('Your Account');
        this.getProfile();
    }
    // get initial data to populate form
    getProfile() {
        this.profileService.getUserProfile()
            .subscribe(response => {
                if (!response[0].address) this.addressExist = false; // to trigger ngif 'add address'
                else this.addressExist = true;
                this.userInfo = response;
                this.userForm = { ...response[0] };
            },
            error => {
                if (error) this.router.navigate(['user/cart']);
            });
    }
    userSubmit() {
        this.profileService.updateUserProfile(this.userForm)
            .subscribe(response => {
                if (response) this.getProfile();
            },
            error => {
                this.error = true;
            });
    }
}
