import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getWsUrl } from "../api/client";

const RealtimeContext = createContext(null);

const RECONNECT_MS = 3000;
const HEARTBEAT_MS = 25000;

/**
 * ការតភ្ជាប់ WebSocket តែមួយ ចែករំលែកទូទាំងកម្មវិធី (single connection)
 * ទទួលព្រឹត្តិការណ៍ពី Backend: products_changed / slides_changed / settings_changed
 *
 * - បើក Socket តែម្តងនៅ App level (មិនបើកមួយកន្លែងម្តង)
 * - ផ្ញើ "ping" រៀងរាល់ 25 វិនាទី ដើម្បីរក្សាការតភ្ជាប់ឱ្យនៅរស់
 * - បើការតភ្ជាប់ដាច់ -> ត្រឡប់មកភ្ជាប់វិញរៀងរាល់ 3 វិនាទី
 * - Components ចុះឈ្មោះស្តាប់តាម type តាមរយៈ useRealtime(type, handler)
 */
export function RealtimeProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map()); // type -> Set(handler)
  const wsRef = useRef(null);
  const retryRef = useRef(null);
  const heartbeatRef = useRef(null);
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false;
    const listeners = listenersRef.current;

    const notify = (type, message) => {
      const set = listeners.get(type);
      if (!set) return;
      set.forEach((fn) => {
        try {
          fn(message);
        } catch {
          /* ignore handler errors */
        }
      });
    };

    const clearTimers = () => {
      clearTimeout(retryRef.current);
      clearInterval(heartbeatRef.current);
    };

    const connect = () => {
      if (closedRef.current) return;
      let ws;
      try {
        ws = new WebSocket(getWsUrl("/ws/products"));
      } catch {
        retryRef.current = setTimeout(connect, RECONNECT_MS);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        heartbeatRef.current = setInterval(() => {
          try {
            if (ws.readyState === WebSocket.OPEN) ws.send("ping");
          } catch {
            /* ignore */
          }
        }, HEARTBEAT_MS);
      };

      ws.onmessage = (e) => {
        let data = e.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            return; // ping / non-JSON -> ignore
          }
        }
        if (data && typeof data.type === "string") notify(data.type, data);
      };

      ws.onclose = () => {
        setConnected(false);
        clearInterval(heartbeatRef.current);
        wsRef.current = null;
        if (!closedRef.current) {
          retryRef.current = setTimeout(connect, RECONNECT_MS);
        }
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      };
    };

    connect();

    return () => {
      closedRef.current = true;
      clearTimers();
      try {
        if (wsRef.current) wsRef.current.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
      listeners.clear();
    };
  }, []);

  const subscribe = useCallback((type, handler) => {
    let set = listenersRef.current.get(type);
    if (!set) {
      set = new Set();
      listenersRef.current.set(type, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }, []);

  const value = useMemo(() => ({ connected, subscribe }), [connected, subscribe]);

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

/**
 * ចុះឈ្មោះស្តាប់ព្រឹត្តិការណ៍ real-time តាម type ។
 * handler ត្រូវបានហៅរាល់ពេល Backend broadcast message ដែលមាន type នេះ។
 * Returns: connected (bool) — true ពេល WebSocket កំពុងតភ្ជាប់
 */
export function useRealtime(type, handler) {
  const { connected, subscribe } = useContext(RealtimeContext);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(
    () => subscribe(type, (message) => handlerRef.current(message)),
    [type, subscribe]
  );

  return connected;
}
