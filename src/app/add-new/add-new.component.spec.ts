import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewComponent } from './add-new.component';

describe('AddNewComponent', () => {
    let component: AddNewComponent;
    let fixture: ComponentFixture<AddNewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddNewComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddNewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
