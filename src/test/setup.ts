import "@testing-library/jest-dom";

// Store MediaQueryList instances to update on state changes
const mediaQueryLists = new Map();
let mediaQueryState: Record<string, boolean> = {};

const updateMediaQueryState = (query: string, matches: boolean) => {
  mediaQueryState[query] = matches;
  const lists = mediaQueryLists.get(query);
  if (lists) {
    lists.forEach((list: MediaQueryList) => {
      const event = new Event('change');
      list.dispatchEvent(event);
    });
  }
};

// Helper to simulate viewport changes
(window as any).__mockMediaQuery = {
  updateMediaQueryState,
  setMediaQueryState: (newState: Record<string, boolean>) => {
    mediaQueryState = newState;
    // Trigger changes for all existing queries
    Object.entries(newState).forEach(([query, matches]) => {
      updateMediaQueryState(query, matches);
    });
  },
  clearMediaQueryState: () => {
    mediaQueryState = {};
  }
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => {
    const listeners: Array<(this: MediaQueryList, ev: MediaQueryListEvent) => any> = [];
    
    const mql: MediaQueryList = {
      get matches() {
        return mediaQueryState[query] ?? false;
      },
      media: query,
      onchange: null,
      addListener: (listener) => {
        listeners.push(listener);
      },
      removeListener: (listener) => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      },
      addEventListener: (type, listener) => {
        if (type === 'change') {
          mql.addListener(listener as any);
        }
      },
      removeEventListener: (type, listener) => {
        if (type === 'change') {
          mql.removeListener(listener as any);
        }
      },
      dispatchEvent: (event) => {
        if (event.type === 'change') {
          const mqlEvent = event as MediaQueryListEvent;
          if (mql.onchange) {
            mql.onchange.call(mql, mqlEvent);
          }
          listeners.forEach((listener) => {
            listener.call(mql, mqlEvent);
          });
        }
        return true;
      },
    };
    
    // Store the MediaQueryList for later updates
    if (!mediaQueryLists.has(query)) {
      mediaQueryLists.set(query, []);
    }
    mediaQueryLists.get(query).push(mql);
    
    return mql;
  },
});