import { Component, OnInit, PLATFORM_ID, Injector, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { ProfileService } from './profile.service';

import { User } from './user.interface';
import { UserService } from '../shared/user.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.scss'],
    providers: [ProfileService],
    imports: [RouterLink, FormsModule, DatePipe]
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private titleService = inject(Title);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);

  error = false;

  addressExist = true;

  userInfo = signal<User[] | undefined>(undefined);

  userForm = signal<User | undefined>(undefined);

  modalReference: NgbModalRef;

  modalService: NgbModal;

  constructor() {
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

  open(content: unknown) {
    this.modalReference = this.modalService.open(content);
  }

  getProfile() {
    this.profileService.getUserProfile().subscribe(
      response => {
        this.addressExist = !!response[0].address;
        this.userInfo.set(response);
        this.userForm.set({ ...response[0] });
        const formValue = this.userForm();
        if (formValue) {
          this.userService.setUser(formValue.given_name);
        }
      },
      error => {
        if (error && error.status === 401) {
          this.redirectToLogin();
        }
      }
    );
  }

  userSubmit() {
    const formValue = this.userForm();
    if (formValue) {
      this.profileService.updateUserProfile(formValue).subscribe(
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
}
