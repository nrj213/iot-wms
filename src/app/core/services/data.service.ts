import { Injectable, Output, EventEmitter } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { User } from '@app/views/common/models/user.model';

@Injectable()
export class DataService {

    // @Output() toggleEvent: EventEmitter<any> = new EventEmitter();

    // toggleNavBar() {
    //     this.toggleEvent.emit();
    // }

    currentUserDetailsSubject = new BehaviorSubject<User>({
        name: null,
        statusId: null,
        roleId: null,
        roleName: null,
        areaId: null,
        staffId: null
    });
    
    currentUserDetails = this.currentUserDetailsSubject.asObservable();

    // private userRoles = new BehaviorSubject({});
    // currentUserRoles = this.userRoles.asObservable();

    passUserDetails(details: User) {
        this.currentUserDetailsSubject.next(details);
    }

    // passUserRoles(data: Object) {
    //     this.userRoles.next(data);
    // }
}