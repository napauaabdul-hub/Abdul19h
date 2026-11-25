import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

interface ToastState { id: number; message: string; ok: boolean }
const ToastCtx = createContext<(message: string, ok?: boolean) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((message: string, ok = true) => {
    const id = Date.now();
    setToast({ id, message, ok });
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setToast(null));
      }, 3200);
    });
  }, [opacity]);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <Animated.View style={[styles.toast, { opacity }, toast.ok ? styles.ok : styles.err]} pointerEvents="none">
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
}

const styles = StyleSheet.create({
  toast: { position: "absolute", bottom: 28, left: 20, right: 20, padding: 13, borderRadius: 10, zIndex: 999, elevation: 999 },
  ok: { backgroundColor: "#16a34a" },
  err: { backgroundColor: "#dc2626" },
  text: { color: "#fff", fontWeight: "600", textAlign: "center" },
});
