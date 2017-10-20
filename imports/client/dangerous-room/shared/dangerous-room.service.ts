import { Injectable } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { Observable, Observer } from 'rxjs/Rx';

import { BaseService } from '../../lib';

import {
    drCollectionEvents,
    drCollectionRooms,
    drCollectionContacts,
    drCollectionNotifications
} from '../../../collections';
import {Subject} from "rxjs/Subject";

@Injectable()
export class DangerousRoomService extends BaseService {

    private _notifications = {};
    private _notifications$ = new Subject();
    private notifications = [];

    constructor() {
        super();
    }

    get allEvents$():Observable<any[]> {
        return this.MeteorSubscribeAutorun('dangerous-room/events',() => drCollectionEvents.find({},{sort:{date:-1}}).fetch());
    }

    deleteEvent(itemID: string): void {
        Meteor.call('dangerous-room/events/delete', itemID);
    }

    get allRooms$():Observable<any[]> {
        return this.MeteorSubscribeAutorun('dangerous-room/rooms',() => drCollectionRooms.find({}).fetch());
    }

    get allContacts$():Observable<any[]> {
        return this.MeteorSubscribeAutorun('dangerous-room/contacts',() => drCollectionContacts.find({}).fetch());
    }

    get allNotifications$():Observable<any[]> {
        return this.MeteorSubscribeAutorun('dangerous-room/notifications/new',
            () => drCollectionNotifications
                .find({"showed":{$exists:false}},{sort:{ts:-1}})
                .fetch()
        );
    }

    getLastNotifications(e?):any[] {
        if(e && e.length > 0 && !_.find(this.notifications,(n) => n["_id"] == e[0]["_id"])) {

            e[0]['timeToShow'] = true;
            this.notifications.unshift(e[0]);

            Meteor.setTimeout(() => {
                e[0]['timeToShow'] = false;
            },5000);
        }
        this._notifications$.next(this.notifications);
        return this.notifications;
    }
    /**
     * @deprecated
     * @param {any[]} notif
     */
    setNotifications(notif:any[]) {
        this._notifications$.next([]);
        notif.forEach(_n => {
            if(!this._notifications[_n._id]) {
                this._notifications[_n._id] = _n;
                this._notifications[_n._id]['timeToShow'] = true;
            }
        });
        this._notifications$.next(_.values(this._notifications));

        Meteor.setTimeout(() => {
            notif.forEach(_n => {
                let id = _n.id;
                this._notifications[_n._id]['timeToShow'] = false;
            });
            this._notifications$.next(_.values(this._notifications));
        },5000);
    }

    /**
     * @returns {Observable<any>}
     */
    get getNotifications$() {
        return this._notifications$.asObservable();
    }

    deleteContact(itemID: string): void {
        Meteor.call('dangerous-room/contacts/delete', itemID);
    }
}
