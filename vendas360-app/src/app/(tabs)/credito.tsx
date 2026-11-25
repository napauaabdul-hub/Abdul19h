import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { openDb } from "../../lib/db.ts";
import {
  creditSummary, listInvoices, getInvoice, payInvoice, payAllClient, listAccounts,
  type Client, type InvoiceRow, type InvoiceDetail, type Account,
} from "../../lib/store.ts";
import { fmtMT, fmtDT } from "../../lib/format.ts";
import { Screen, Card, Button, Badge, Input, Row, Stat, Chip, Empty, COLORS } from "../../components/ui.tsx";
import { useToast } from "../../context/ToastContext.tsx";

export default function CreditoScreen() {
  const toast = useToast();
  const [q, setQ] = React.useState("");
  const [summary, setSummary] = React.useState<{ total_debt: number; clients: Client[] } | null>(null);
  const [client, setClient] = React.useState<Client | null>(null);
  const [invoices, setInvoices] = React.useState<InvoiceRow[]>([]);
  const [selInv, setSelInv] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<InvoiceDetail | null>(null);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [payAmt, setPayAmt] = React.useState("");
  const [payAcc, setPayAcc] = React.useState<number | null>(null);
  const [allOpen, setAllOpen] = React.useState(false);
  const [allAcc, setAllAcc] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    const db = await openDb();
    const s = await creditSummary(db);
    setSummary(s);
    setAccounts(await listAccounts(db));
    if (!allAcc) setAllAcc((await listAccounts(db))[0]?.id ?? null);
    if (!payAcc) setPayAcc((await listAccounts(db))[0]?.id ?? null);
    if (client) {
      const invs = await listInvoices(db, client.id);
      setInvoices(invs);
      const id = selInv && invs.some((i) => i.id === selInv) ? selInv : invs[0]?.id ?? null;
      setSelInv(id);
      setDetail(id ? await getInvoice(db, id) : null);
    }
  }, [client, selInv, payAcc, allAcc]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const selectClient = async (c: Client) => {
    setClient(c);
    setSelInv(null);
    setDetail(null);
  };

  const selectInv = async (id: number) => {
    setSelInv(id);
    const db = await openDb();
    const d = await getInvoice(db, id);
    setDetail(d);
    setPayAmt(d ? d.saldo.toFixed(2) : "");
  };

  const confirmarPagamento = async () => {
    if (!detail || !payAcc) return;
    try {
      const db = await openDb();
      const r = await payInvoice(db, detail.id, parseFloat(payAmt || "0"), payAcc);
      toast(`Pagamento confirmado — ${client?.name} · ${fmtMT(r.pago)} — Fatura #${r.number} ${r.status === "LIQUIDADA" ? "liquidada" : "parcial"}`);
      setSelInv(null); setDetail(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", false);
    }
  };

  const liquidarTudo = async () => {
    if (!client || !allAcc) return;
    try {
      const db = await openDb();
      const r = await payAllClient(db, client.id, allAcc);
      toast(`Pagamento confirmado — ${fmtMT(r.pago)} em ${r.faturas} fatura(s) liquidada(s)`);
      setAllOpen(false);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", false);
    }
  };

  const tone = (s: string) => (s === "PARCIAL" ? "amber" : s === "LIQUIDADA" ? "green" : "red") as "amber" | "green" | "red";

  return (
    <Screen title="Gestão de Crédito">
      <Input placeholder="Procurar cliente..." value={q} onChangeText={setQ} />
      <FlatList
        data={(summary?.clients ?? []).filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()))}
        keyExtractor={(c) => String(c.id)}
        scrollEnabled={false}
        renderItem={({ item: c }) => (
          <Pressable style={[styles.clientRow, client?.id === c.id && { backgroundColor: "#f0fdf4" }]} onPress={() => selectClient(c)}>
            <Text style={{ fontWeight: "700" }}>{c.name}</Text>
            <Text style={{ fontWeight: "800", color: COLORS.red }}>{fmtMT(c.debt)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Empty text="Sem clientes com dívida." />}
      />
      <Card>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>Dívida total acumulada</Text>
          <Text style={{ fontWeight: "800", color: COLORS.red }}>{fmtMT(summary?.total_debt ?? 0)}</Text>
        </Row>
        <Button variant="green" label="Liquidar Tudo" onPress={() => setAllOpen(true)} style={{ marginTop: 8 }} />
      </Card>

      {client && (
        <Card>
          <Row style={{ alignItems: "center", gap: 8 }}>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{client.name}</Text>
            {client.debt > 0 ? <Badge label={`dívida ${fmtMT(client.debt)}`} tone="red" /> : <Badge label="sem dívida" tone="green" />}
          </Row>
          {invoices.map((i) => (
            <Pressable key={i.id} style={[styles.invRow, selInv === i.id && { borderColor: COLORS.green, backgroundColor: "#f0fdf4" }]} onPress={() => selectInv(i.id)}>
              <View>
                <Text style={{ fontWeight: "700" }}>#{i.number} <Badge label={i.status} tone={tone(i.status)} /></Text>
                <Text style={{ fontSize: 11, color: COLORS.muted }}>{fmtDT(i.created_at)} · saldo devedor <Text style={{ fontWeight: "700" }}>{fmtMT(i.saldo)}</Text></Text>
              </View>
              <Text style={{ fontSize: 12, color: COLORS.muted, fontWeight: "600" }}>Selecionar</Text>
            </Pressable>
          ))}
          {invoices.length === 0 && <Empty text="Sem faturas em aberto." />}
        </Card>
      )}

      {detail && (
        <Card>
          <Row style={{ alignItems: "center", gap: 8 }}>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>Fatura #{detail.number}</Text>
            <Badge label={detail.status} tone={tone(detail.status)} />
          </Row>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            <Stat label="Saldo devedor" value={fmtMT(detail.saldo)} color={COLORS.red} />
            <Stat label="Data" value={fmtDT(detail.created_at)} />
            <Stat label="Valor original" value={fmtMT(detail.original)} />
            <Stat label="Já pago" value={fmtMT(detail.paid)} color={COLORS.green} />
            <Stat label="Produtos" value={String(detail.n_items)} />
          </View>
          {detail.items.length > 0 && detail.items.map((it, k) => (
            <Row key={k} style={{ justifyContent: "space-between", paddingVertical: 3 }}>
              <Text style={{ fontSize: 12 }}>{it.name} × {it.qty}</Text>
              <Text style={{ fontSize: 12, fontWeight: "600" }}>{fmtMT(it.qty * it.price)}</Text>
            </Row>
          ))}
          {detail.status !== "LIQUIDADA" ? (
            <>
              <Input label="Liquidar Fatura — Valor a pagar (MT)" value={payAmt} onChangeText={setPayAmt} keyboardType="decimal-pad" />
              <Text style={styles.lbl}>Conta destino</Text>
              <View style={styles.wrap}>
                {accounts.map((a) => (
                  <Chip key={a.id} label={a.name} active={payAcc === a.id} onPress={() => setPayAcc(a.id)} />
                ))}
              </View>
              <Button variant="green" label="Confirmar Pagamento" onPress={confirmarPagamento} style={{ marginTop: 4 }} />
            </>
          ) : (
            <Text style={{ color: COLORS.muted, marginTop: 8 }}>Fatura liquidada. ✅</Text>
          )}
        </Card>
      )}

      <Modal visible={allOpen} transparent animationType="slide" onRequestClose={() => setAllOpen(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Liquidar Tudo — {client?.name}</Text>
            <Text style={styles.lbl}>Conta destino</Text>
            <View style={styles.wrap}>
              {accounts.map((a) => (
                <Chip key={a.id} label={a.name} active={allAcc === a.id} onPress={() => setAllAcc(a.id)} />
              ))}
            </View>
            <Row style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" label="Cancelar" onPress={() => setAllOpen(false)} />
              <Button variant="green" label="Confirmar Pagamento" onPress={liquidarTudo} />
            </Row>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  clientRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: "#fff", marginBottom: 6, borderWidth: 1, borderColor: COLORS.line },
  invRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, marginTop: 8 },
  lbl: { fontSize: 12, color: COLORS.muted, marginBottom: 6, marginTop: 6 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  modalBack: { flex: 1, backgroundColor: "rgba(15,23,42,.55)", justifyContent: "center", padding: 18 },
  modal: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
});
