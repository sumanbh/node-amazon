import {
  Component,
  OnInit,
  PLATFORM_ID,
  Injector,
  Inject
} from '@angular/core';
import { ProfileService } from './profile.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser } from '@angular/common';

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
  modalReference;
  modalService;

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
        if (!response[0].address) this.addressExist = false;
        // to trigger ngif 'add address'
        else this.addressExist = true;
        this.userInfo = response;
        this.userForm = { ...response[0] };
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
      error => {
        this.error = true;
      }
    );
  }
}
