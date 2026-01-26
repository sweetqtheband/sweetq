"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type EventHandler = (data: any) => void;

export function useEventBus(channel: string) {
  const [isConnected, setIsConnected] = useState(false); // Estado de conexión
  const eventHandlers = useRef<Record<string, EventHandler>>({}); // Manejadores de eventos por nombre
  const eventSourceRef = useRef<EventSource | null>(null); // Referencia al EventSource
  const retryTimeout = useRef<NodeJS.Timeout | null>(null); // Para manejar el reintento de conexión

  const on = (handler: EventHandler) => {
    eventHandlers.current[channel] = handler;
  };

  const off = () => {
    delete eventHandlers.current[channel];
  };

  // Reintentar la conexión en caso de error
  const retryConnection = useCallback(() => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
    }

    retryTimeout.current = setTimeout(() => {
      console.log("Retrying connection...");
      connect(); // Intentar reconectar
    }, 3000); // Reintentar cada 3 segundos
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close(); // Cerrar cualquier conexión previa
    }

    const eventSource = new EventSource("/api/events");
    eventSourceRef.current = eventSource;

    // Manejar la conexión del EventSource
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("Connected to EventSource");
    };

    // Manejar el error
    eventSource.onerror = (err) => {
      console.log("EventSource error:", err);
      setIsConnected(false);
      eventSource.close();
      retryConnection();
    };

    // Manejar los mensajes
    eventSource.onmessage = (event) => {
      try {
        const { eventType: eventName, data } = JSON.parse(event.data);
        if (eventHandlers.current[eventName]) {
          eventHandlers.current[eventName](data);
        }
      } catch (error) {
        console.error("Failed to parse event:", event.data);
      }
    };
  }, [retryConnection]);

  // Conectar al iniciar el componente
  useEffect(() => {
    connect();

    // Limpiar la conexión al desmontar
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [connect]);

  return { on, off, isConnected };
}
