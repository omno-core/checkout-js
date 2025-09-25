export class EventEmitter<Events extends Record<string, any>> {
  private listeners: {
    [K in keyof Events]?: ((payload: Events[K]) => void)[];
  } = {};

  on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    (this.listeners[event] ??= []).push(handler);
  }

  off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    const arr = this.listeners[event];
    if (arr) {
      this.listeners[event] = arr.filter((h) => h !== handler);
    }
  }

  once<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void) {
    const wrapper = (payload: Events[K]) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.on(event, wrapper);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners[event]?.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        console.error(`Error in handler for event "${String(event)}":`, err);
      }
    });
  }
}
