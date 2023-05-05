import { Injectable } from "@angular/core";

@Injectable()
export class EventEmitterService {
    events:Array<any> = [];

    uuid() {
        let dt = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c=='x' ? r :(r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
            
    /**
     * Trigger event
     * @param {String} event Event name
     * @param {Any} data Payload
     */
    trigger (event:any, data:any) {
      if (this.events[event]) {
        return this.events[event].forEach((subscription:any) => {
          subscription.callback(data);
        });
      }
    }

    /**
     * Subscribe to event
     * @param {String} event Event name
     * @param {Function} callback Callback function
     */
    subscribe (event:any, callback:any) {
      if (!this.events[event]) {
        this.events[event] = [];
      }

      const id = this.uuid();
      const subscription = {
        id: id,
        event: event,
        callback: callback,
        dispose: () => this.dispose({ id: id, event: event })
      };

      this.events[event].push(subscription);

      return subscription;
    }

    /**
     * Dispose subscription
     * @param {Object} subscription Subscription
     */
    dispose (subscription:any) {
      const index = this.events[subscription.event].findIndex((sub:any) => sub.id === subscription.id);
      this.events[subscription.event].splice(index, 1);      

      return true;
    }

    /**
     * Subscribe only one time
     * @param {String} event Event name
     * @param {Function} callback Callback function
     */
    subscribeOnce (event:any, callback:Function = () => ({})) {
      const subscription = this.subscribe(event, (data:any) => {
        callback(data);
        this.dispose(subscription);
      });
    }
}