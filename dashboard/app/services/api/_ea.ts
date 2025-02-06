class EventAggregator {
  private events: { [key: string]: Function[] } = {};

  subscribe(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  }

  publish(event: string, data: any) {
    if (!this.events[event]) {
      return;
    }

    this.events[event].forEach((callback) => {
      callback(data);
    });
  }
}

export const ea = new EventAggregator();
