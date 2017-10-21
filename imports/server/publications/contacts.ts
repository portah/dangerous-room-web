import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { Log } from '../../modules';
import { drCollectionContacts } from '../../collections';

let fields = { fields: { telephone: 0, date: 1 } };

/** Publish all `Contacts`. */
Meteor.publish('dangerous-room/contacts', function(): Mongo.Cursor<ContactItem> {
  console.log('dangerous-room/contacts publish', Meteor.userId(), this.connection.id);
  return drCollectionContacts.find({});
});

// drCollectionContacts.deny({
//     insert: function () {
//         return true;
//     },
//     update: function () {
//         return true;
//     },
//     remove: function () {
//         return true;
//     }
// });

drCollectionContacts.allow({
    update: function (u,from,fields,to) {
        // Log.debug('Contacts update from:',u,d,dn,dnn);
        Log.debug('Contacts update from:',from);
        Log.debug('Contacts update to:',to);
        return true;
    },
    insert: function (u,d) {
        Log.debug('Contacts insert:',u,d);
        return true;
    },
    remove: function (u,d) {
        Log.debug('Contacts remove:',u,d);
        return true;
    }
});

Meteor.methods({
    /**
     *
     * @param param
     */
    "dangerous-room/contacts/delete": function (id) {
        console.log("dangerous-room/contacts: param = " + JSON.stringify(id));

        check(id, String);
        let event = drCollectionContacts.findOne({_id: id});
        if (!event) {
            console.log("dangerous-room/contacts/delete: Can't find contact with id " + id);
            throw new Meteor.Error(500, "Can't find contact");
        }
        drCollectionContacts.remove({"_id": id});
    }
});
