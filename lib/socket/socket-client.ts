import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export function resolveActiveToken(explicitToken?: string): string | null {
  if (explicitToken) return explicitToken;
  if (typeof window === "undefined") return null;
  const isCustomerRoute = window.location.pathname.startsWith("/s/");
  return isCustomerRoute
    ? localStorage.getItem("serviceos_customer_token") || localStorage.getItem("serviceos_token")
    : localStorage.getItem("serviceos_token") || localStorage.getItem("serviceos_customer_token");
}

export function getSocket(token?: string): Socket {
  const activeToken = resolveActiveToken(token);

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: (cb) => {
        cb({ token: resolveActiveToken(token) });
      },
    });
  }

  if (activeToken) {
    socket.auth = { token: activeToken };
  }

  return socket;
}

export function reconnectSocket(newToken?: string): Socket {
  const token = resolveActiveToken(newToken);
  if (socket) {
    socket.disconnect();
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
    return socket;
  }
  const s = getSocket(token || undefined);
  if (token && !s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
