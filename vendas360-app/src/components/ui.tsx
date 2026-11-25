import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { syncNow, isOnline } from "../lib/api.ts";
import { openDb } from "../lib/db.ts";
import { useToast } from "../context/ToastContext.tsx";

export const COLORS = {
  green: "#16a34a", greenD: "#15803d", red: "#dc2626", blue: "#2563eb", amber: "#d97706",
  bg: "#f1f5f9", card: "#ffffff", ink: "#0f172a", muted: "#64748b", line: "#e2e8f0", dark: "#0f172a",
};

export function Screen({ title, children, style }: { title: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const [syncing, setSyncing] = React.useState(false);
  const onSync = async () => {
    setSyncing(true);
    try {
      const db = await openDb();
      const online = await isOnline();
      if (!online) { toast("Offline — a continuar com dados locais", false); return; }
      const r = await syncNow(db);
      toast(`Sincronizado: ${r.pulled} produtos recebidos, ${r.pushed} vendas enviadas${r.errors.length ? `, ${r.errors.length} erros` : ""}`, r.errors.length === 0);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro na sincronização", false);
    } finally {
      setSyncing(false);
    }
  };
  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: COLORS.bg }, style]}>
      <View style={styles.topbar}>
        <Pressable onPress={() => router.navigate("/pdv")} style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>V</Text></View>
          <Text style={styles.brandName}>VENDAS <Text style={{ color: "#4ade80" }}>360</Text></Text>
        </Pressable>
        <Pressable onPress={onSync} disabled={syncing} style={styles.syncBtn}>
          <Text style={styles.syncText}>{syncing ? "…" : "⇅ Sync"}</Text>
        </Pressable>
        <View style={styles.userChip}>
          <View style={styles.avatar}><Text style={styles.avatarText}>MC</Text></View>
          <View>
            <Text style={styles.userName}>Montes Chipire</Text>
            <Text style={styles.userRole}>Gestor</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ label, onPress, variant = "gray", disabled, style }: {
  label: string; onPress: () => void; variant?: "green" | "red" | "blue" | "amber" | "gray" | "ghost"; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const bg = { green: COLORS.green, red: COLORS.red, blue: COLORS.blue, amber: COLORS.amber, gray: "#475569", ghost: "#e2e8f0" }[variant];
  const color = variant === "ghost" ? COLORS.ink : "#fff";
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, style]}>
      <Text style={[styles.btnText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, tone = "gray" }: { label: string; tone?: "green" | "amber" | "red" | "gray" | "blue" }) {
  const bg = { green: "#dcfce7", amber: "#fef3c7", red: "#fee2e2", gray: "#e2e8f0", blue: "#dbeafe" }[tone];
  const color = { green: "#166534", amber: "#92400e", red: "#991b1b", gray: "#475569", blue: "#1e40af" }[tone];
  return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.badgeText, { color }]}>{label}</Text></View>;
}

export function Input({ label, value, onChangeText, placeholder, keyboardType, style }: {
  label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad"; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ marginBottom: 10 }, style]}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} placeholderTextColor="#94a3b8" />
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </Card>
  );
}

export function Empty({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  topbar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.dark, paddingHorizontal: 12, paddingVertical: 8 },
  brand: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1 },
  logo: { width: 28, height: 28, borderRadius: 7, backgroundColor: COLORS.green, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#fff", fontWeight: "800" },
  brandName: { color: "#fff", fontSize: 12, letterSpacing: 1 },
  syncBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: "#1e293b" },
  syncText: { color: "#cbd5e1", fontSize: 12, fontWeight: "600" },
  userChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.green, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  userName: { color: "#fff", fontSize: 11, fontWeight: "700" },
  userRole: { color: "#94a3b8", fontSize: 9 },
  content: { padding: 14, paddingBottom: 40 },
  title: { fontSize: 19, fontWeight: "800", color: COLORS.ink, marginBottom: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 13, marginBottom: 12, shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  btn: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9, alignItems: "center" },
  btnText: { fontWeight: "700", fontSize: 14 },
  chip: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, backgroundColor: "#e2e8f0", marginRight: 7, marginBottom: 7 },
  chipActive: { backgroundColor: COLORS.green },
  chipText: { fontWeight: "600", fontSize: 13, color: COLORS.ink },
  chipTextActive: { color: "#fff" },
  badge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  inputLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: "#fff", fontSize: 14 },
  row: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, minWidth: 100, marginBottom: 10 },
  statLabel: { fontSize: 10, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: "800", marginTop: 2 },
  empty: { color: COLORS.muted, textAlign: "center", padding: 16, fontSize: 13 },
});
