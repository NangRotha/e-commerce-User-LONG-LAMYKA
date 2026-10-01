/**
 * Polyfills for legacy iOS / Safari browsers (iPhone 6 / iOS 12.x+)
 * Ensures modern JavaScript and Observer APIs don't crash legacy engines.
 */

// 1. globalThis polyfill (missing on iOS < 12.2)
if (typeof window !== 'undefined' && typeof window.globalThis === 'undefined') {
  window.globalThis = window;
}
if (typeof self !== 'undefined' && typeof self.globalThis === 'undefined') {
  self.globalThis = self;
}

// 2. IntersectionObserver polyfill (missing on iOS < 12.2)
import 'intersection-observer';

// 3. ResizeObserver polyfill (missing on iOS < 13.4, causes crash in DotLottie & modern UI)
import ResizeObserverPolyfill from 'resize-observer-polyfill';
if (typeof window !== 'undefined') {
  if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserverPolyfill;
  }
  if (typeof globalThis !== 'undefined' && !globalThis.ResizeObserver) {
    globalThis.ResizeObserver = ResizeObserverPolyfill;
  }
}

// 4. requestIdleCallback & cancelIdleCallback (missing on Safari < 16.4)
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

// 5. queueMicrotask (missing on iOS < 12.2)
if (typeof window !== 'undefined' && !window.queueMicrotask) {
  window.queueMicrotask = function (callback) {
    Promise.resolve().then(callback).catch(function (err) {
      setTimeout(function () { throw err; }, 0);
    });
  };
}

// 6. Promise.allSettled (missing on iOS < 13)
if (typeof Promise !== 'undefined' && !Promise.allSettled) {
  Promise.allSettled = function (promises) {
    return Promise.all(
      promises.map(function (p) {
        return Promise.resolve(p).then(
          function (value) { return { status: 'fulfilled', value: value }; },
          function (reason) { return { status: 'rejected', reason: reason }; }
        );
      })
    );
  };
}

// 7. Object.fromEntries (missing on iOS < 12.2)
if (typeof Object !== 'undefined' && !Object.fromEntries) {
  Object.fromEntries = function (entries) {
    if (!entries) return {};
    var obj = {};
    for (var pair of entries) {
      if (pair) obj[pair[0]] = pair[1];
    }
    return obj;
  };
}
