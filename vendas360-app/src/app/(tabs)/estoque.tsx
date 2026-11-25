import React from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { openDb } from "../../lib/db.ts";
import { stockPosition, addStockEntry, listProducts, type StockRow, type Product } from "../../lib/store.ts";
import { fmtQ, todayStr } from "../../lib/format.ts";
import { Screen, Card, Button, Badge, Input, Row, Empty, COLORS } from "../../components/ui.tsx";
import { useToast } from "../../context/ToastContext.tsx";

export default function EstoqueScreen() {
  const toast = useToast();
  const [date, setDate] = React.useState(todayStr());
  const [rows, setRows] = React.useState<StockRow[]>([]);
  const [prods, setProds] = React.useState<Product[]>([]);
  const [open, setOpen] = React.useState(false);
  const [pid, setPid] = React.useState<number | null>(null);
  const [qty, setQty] = React.useState("1");

  const load = React.useCallback(async () => {
    const db = await openDb();
    setRows(await stockPosition(db, date));
    setProds(await listProducts(db, {}));
    if (!pid) setPid((await listProducts(db, {}))[0]?.id ?? null);
  }, [date, pid]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const entrada = async () => {
    try {
      const db = await openDb();
      await addStockEntry(db, pid!, parseFloat(qty || "0"), "Entrada de mercadoria");
      setOpen(false); setQty("1");
      toast("Entrada registada");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", false);
    }
  };

  return (
    <Screen title="Posição de Estoque">
      <Row style={{ alignItems: "flex-end" }}>
        <Input label="Dia" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" style={{ flex: 1 }} />
        <Button variant="green" label="＋ Entrada de Mercadoria" onPress={() => setOpen(true)} />
      </Row>
      <Card>
        <View style={[styles.head, styles.row]}>
          <Text style={[styles.hcell, { flex: 2 }]}>PRODUTO</Text>
          <Text style={styles.hcell}>ABERT.</Text>
          <Text style={styles.hcell}>ENTR.</Text>
          <Text style={styles.hcell}>SAÍDAS</Text>
          <Text style={styles.hcell}>FECHO</Text>
        </View>
        <FlatList
          data={rows}
          keyExtractor={(r) => String(r.id)}
          scrollEnabled={false}
          renderItem={({ item: p }) => (
            <View style={[styles.row, p.fecho <= p.min_stock && { backgroundColor: "#fef2f2", borderRadius: 6 }]}>
              <View style={{ flex: 2 }}>
                <Text style={{ fontWeight: "700", fontSize: 12 }}>{p.name}</Text>
                <Text style={{ fontSize: 10, color: COLORS.muted }}>{p.category}{p.fecho <= p.min_stock ? " · " : ""}{p.fecho <= p.min_stock ? <Badge label="ruptura" tone="red" /> : null}</Text>
              </View>
              <Text style={[styles.cell, { color: COLORS.muted }]}>{fmtQ(p.abertura, p.unit)}</Text>
              <Text style={[styles.cell, { color: COLORS.green }]}>+{fmtQ(p.entradas, p.unit)}</Text>
              <Text style={[styles.cell, { color: COLORS.red }]}>{fmtQ(p.saidas, p.unit)}</Text>
              <Text style={[styles.cell, { fontWeight: "800" }]}>{fmtQ(p.fecho, p.unit)}</Text>
            </View>
          )}
          ListEmptyComponent={<Empty text="Sem produtos." />}
        />
      </Card>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nova Entrada de Mercadoria</Text>
            <Text style={styles.lbl}>Produto</Text>
            <View style={{ maxHeight: 220 }}>
              <FlatList
                data={prods}
                keyExtractor={(p) => String(p.id)}
                renderItem={({ item: p }) => (
                  <Text onPress={() => setPid(p.id)} style={[styles.pick, pid === p.id && { backgroundColor: "#f0fdf4", borderColor: COLORS.green }]}>{p.name}</Text>
                )}
              />
            </View>
            <Input label="Quantidade" value={qty} onChangeText={setQty} keyboardType="decimal-pad" />
            <Row style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" label="Cancelar" onPress={() => setOpen(false)} />
              <Button variant="green" label="Confirmar" onPress={entrada} />
            </Row>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: 1, borderColor: COLORS.line },
  head: { borderBottomWidth: 2, borderColor: COLORS.line, paddingBottom: 6 },
  hcell: { flex: 1, fontSize: 10, color: COLORS.muted, fontWeight: "700" },
  cell: { flex: 1, fontSize: 11, textAlign: "right" },
  pick: { padding: 9, borderWidth: 1, borderColor: COLORS.line, borderRadius: 8, marginBottom: 6, fontSize: 13 },
  lbl: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  modalBack: { flex: 1, backgroundColor: "rgba(15,23,42,.55)", justifyContent: "center", padding: 18 },
  modal: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
});
