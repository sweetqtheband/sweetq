'use client';

import { useEffect, useRef, useState } from 'react';

type EventHandler = (data: any) => void;

export function useEventBus(channel: string) {
  const [isConnected, setIsConnected] = useState(false); // Estado de conexión
  const eventHandlers = useRef<Record<string, EventHandler>>({}); // Manejadores de eventos por nombre
  const eventSourceRef = useRef<EventSource | null>(null); // Referencia al EventSource

  const on = (handler: EventHandler) => {
    eventHandlers.current[channel] = handler;
  };

  const off = () => {
    delete eventHandlers.current[channel];
  };

  useEffect(() => {
    const eventSource = new EventSource('/api/events');
    eventSourceRef.current = eventSource;

    // Manejar la conexión del EventSource
    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    eventSource.onmessage = (event) => {
      try {
        const { eventType: eventName, data } = JSON.parse(event.data);
        if (eventHandlers.current[eventName]) {
          eventHandlers.current[eventName](data);
        }
      } catch (error) {
        console.error('Failed to parse event:', event.data);
      }
    };

    return () => eventSource.close();
  }, []);

  return { on, off, isConnected };
}
