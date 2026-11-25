import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { openDb } from "../../lib/db.ts";
import { cashSummary, addCashMovement, cancelMovement, type CashSummary, type CashMovement } from "../../lib/store.ts";
import { fmtMT, fmtDT, todayStr } from "../../lib/format.ts";
import { Screen, Card, Button, Badge, Input, Row, Stat, Chip, Empty, COLORS } from "../../components/ui.tsx";
import { useToast } from "../../context/ToastContext.tsx";

type MoveType = "ENTRADA" | "SAIDA" | "REEMBOLSO";

export default function CaixaScreen() {
  const toast = useToast();
  const router = useRouter();
  const [sum, setSum] = React.useState<CashSummary | null>(null);
  const [date, setDate] = React.useState(todayStr());
  const [modal, setModal] = React.useState<MoveType | null>(null);
  const [acc, setAcc] = React.useState<number | null>(null);
  const [amt, setAmt] = React.useState("");
  const [desc, setDesc] = React.useState("");

  const load = React.useCallback(async () => {
    const db = await openDb();
    setSum(await cashSummary(db, date));
    if (!acc) setAcc((await cashSummary(db, date)).accounts[0]?.id ?? null);
  }, [date, acc]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const confirmMove = async () => {
    try {
      const db = await openDb();
      await addCashMovement(db, modal!, acc!, parseFloat(amt || "0"), desc);
      setModal(null); setAmt(""); setDesc("");
      toast(`${modal === "ENTRADA" ? "Nova Entrada" : modal === "SAIDA" ? "Nova Saída" : "Quebra / Reembolso"} registado`);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", false);
    }
  };

  const anular = async (id: number) => {
    const db = await openDb();
    await cancelMovement(db, id);
    toast("Movimento anulado");
    load();
  };

  const toneFor = (t: string) => (t === "ENTRADA" || t === "PAGAMENTO_DIVIDA" ? "green" : t === "SAIDA" ? "red" : t === "REEMBOLSO" ? "amber" : "gray") as "green" | "red" | "amber" | "gray";

  return (
    <Screen title="Gestão de Caixa">
      <Input label="Dia" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
      <Row>
        <Button variant="green" label="＋ NOVA ENTRADA" onPress={() => setModal("ENTRADA")} style={{ flex: 1 }} />
        <Button variant="red" label="－ NOVA SAÍDA" onPress={() => setModal("SAIDA")} style={{ flex: 1 }} />
        <Button variant="blue" label="↩ QUEBRA / REEMBOLSO" onPress={() => setModal("REEMBOLSO")} style={{ flex: 1 }} />
      </Row>
      <Card>
        <Text style={{ fontWeight: "800", marginBottom: 8 }}>Resumo de Desempenho Diário</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Stat label="Entradas" value={fmtMT(sum?.resumo.ENTRADA.total ?? 0)} color={COLORS.green} />
          <Stat label="Reembolso" value={fmtMT(sum?.resumo.REEMBOLSO.total ?? 0)} color={COLORS.blue} />
          <Stat label="Saídas" value={fmtMT(sum?.resumo.SAIDA.total ?? 0)} color={COLORS.red} />
        </View>
        <Text style={{ fontSize: 11, color: COLORS.muted }}>
          {sum?.resumo.ENTRADA.n ?? 0} Transações · {sum?.resumo.SAIDA.n ?? 0} Movimentos · {sum?.resumo.REEMBOLSO.n ?? 0} Movimentos
        </Text>
      </Card>
      <Row>
        <Button variant="green" label="Pagamento Dívida" onPress={() => router.navigate("/credito")} style={{ flex: 1 }} />
        <Button variant="red" label="Anular Movimento" onPress={() => toast("Toque em “anular” numa linha do histórico")} style={{ flex: 1 }} />
      </Row>
      <Card>
        <Text style={{ fontWeight: "800", marginBottom: 6 }}>Saldo das Contas de Pagamento</Text>
        {sum?.accounts.map((a) => (
          <Row key={a.id} style={{ justifyContent: "space-between", paddingVertical: 7, borderBottomWidth: 1, borderColor: COLORS.line }}>
            <Text style={{ fontSize: 13 }}>{a.name}{a.detail ? <Text style={{ color: COLORS.muted, fontSize: 11 }}> ({a.detail})</Text> : null}</Text>
            <Text style={{ fontWeight: "700" }}>{fmtMT(a.balance ?? 0)}</Text>
          </Row>
        ))}
        <Row style={{ justifyContent: "space-between", paddingTop: 8 }}>
          <Text style={{ fontWeight: "800" }}>TOTAL GERAL</Text>
          <Text style={{ fontWeight: "800" }}>{fmtMT(sum?.total_geral ?? 0)}</Text>
        </Row>
      </Card>
      <Card>
        <Text style={{ fontWeight: "800", marginBottom: 6 }}>Histórico de Movimentos</Text>
        <FlatList
          data={sum?.historico ?? []}
          keyExtractor={(h) => String(h.id)}
          scrollEnabled={false}
          renderItem={({ item: h }: { item: CashMovement & { account_name: string } }) => (
            <Row style={{ alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.line, opacity: h.cancelled ? 0.4 : 1 }}>
              <Text style={{ width: 52, fontSize: 11, color: COLORS.muted }}>{fmtDT(h.created_at).slice(11)}</Text>
              <Badge label={h.type.replace("_", " ")} tone={toneFor(h.type)} />
              <Text style={{ flex: 1, fontSize: 12, marginLeft: 6 }}>{h.account_name} · {h.description ?? ""}</Text>
              <Text style={{ fontWeight: "700", fontSize: 12, width: 95, textAlign: "right" }}>
                {h.type === "SAIDA" || h.type === "REEMBOLSO" ? "−" : "+"}{fmtMT(h.amount)}
              </Text>
              {h.cancelled ? <Badge label="anulado" tone="gray" /> : (
                <Pressable onPress={() => anular(h.id)} style={{ marginLeft: 8, backgroundColor: COLORS.red, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>anular</Text>
                </Pressable>
              )}
            </Row>
          )}
          ListEmptyComponent={<Empty text="Sem movimentos neste dia." />}
        />
      </Card>

      <Modal visible={modal !== null} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{modal === "ENTRADA" ? "Nova Entrada" : modal === "SAIDA" ? "Nova Saída" : "Quebra / Reembolso"}</Text>
            <Text style={styles.lbl}>Conta</Text>
            <View style={styles.wrap}>
              {sum?.accounts.map((a) => (
                <Chip key={a.id} label={`${a.name}${a.detail ? ` (${a.detail})` : ""}`} active={acc === a.id} onPress={() => setAcc(a.id)} />
              ))}
            </View>
            <Input label="Valor (MT)" value={amt} onChangeText={setAmt} keyboardType="decimal-pad" placeholder="0,00" />
            <Input label="Descrição" value={desc} onChangeText={setDesc} placeholder="Motivo..." />
            <Row style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" label="Cancelar" onPress={() => setModal(null)} />
              <Button variant={modal === "ENTRADA" ? "green" : modal === "SAIDA" ? "red" : "blue"} label="Confirmar" onPress={confirmMove} />
            </Row>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalBack: { flex: 1, backgroundColor: "rgba(15,23,42,.55)", justifyContent: "center", padding: 18 },
  modal: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  lbl: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
});
