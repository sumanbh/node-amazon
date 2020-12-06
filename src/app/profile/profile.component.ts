import {
  Component,
  OnInit,
  PLATFORM_ID,
  Injector,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser } from '@angular/common';
import { ProfileService } from './profile.service';

import { User } from './user.interface';
import { UserService } from '../shared/user.service';

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

  modalReference: NgbModalRef;

  modalService: NgbModal;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private titleService: Title,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private injector: Injector
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.modalService = this.injector.get(NgbModal);
    }
  }

  ngOnInit() {
    this.titleService.setTitle('Your Account');
    this.getProfile();
  }

  redirectToLogin() {
    this.userService.clearUser();
    this.router.navigate(['login']);
  }

  open(content) {
    this.modalReference = this.modalService.open(content);
  }

  getProfile() {
    this.profileService.getUserProfile().subscribe(
      response => {
        this.addressExist = !!response[0].address;
        this.userInfo = response;
        this.userForm = { ...response[0] };
        this.userService.setUser(this.userForm.given_name);
      },
      error => {
        if (error && error.status === 401) {
          this.redirectToLogin();
        }
      }
    );
  }

  userSubmit() {
    this.profileService.updateUserProfile(this.userForm).subscribe(
      response => {
        if (response) this.getProfile();
        if (this.modalReference) {
          this.modalReference.close();
        }
      },
      () => {
        this.error = true;
      }
    );
  }
}
