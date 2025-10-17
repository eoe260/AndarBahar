import React, { useState, useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
  // Fix: Initialize useRef with the callback to fix the "Expected 1 arguments, but got 0" error.
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      // Fix: The conditional check is removed as savedCallback.current is now guaranteed to be defined.
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
