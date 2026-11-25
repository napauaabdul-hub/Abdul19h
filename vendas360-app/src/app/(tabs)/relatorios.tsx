import React from "react";
import { FlatList, Share, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import { openDb } from "../../lib/db.ts";
import { salesReport, itemsReport, salesToCsv, type SaleRowOut } from "../../lib/store.ts";
import { fmtMT, fmtDT, todayStr, round2 } from "../../lib/format.ts";
import type { ReportAggregate } from "../../lib/money.ts";
import { Screen, Card, Button, Badge, Input, Row, Stat, Chip, Empty, COLORS } from "../../components/ui.tsx";
import { useToast } from "../../context/ToastContext.tsx";

export default function RelatoriosScreen() {
  const toast = useToast();
  const [from, setFrom] = React.useState(todayStr());
  const [to, setTo] = React.useState(todayStr());
  const [tab, setTab] = React.useState<"extrato" | "itens">("extrato");
  const [agg, setAgg] = React.useState<ReportAggregate | null>(null);
  const [vendas, setVendas] = React.useState<SaleRowOut[]>([]);
  const [itens, setItens] = React.useState<{ name: string; category: string | null; qty: number; total: number; lucro: number }[]>([]);

  const load = React.useCallback(async () => {
    const db = await openDb();
    const r = await salesReport(db, from, to);
    setAgg(r.agg);
    setVendas(r.vendas);
    setItens(await itemsReport(db, from, to));
  }, [from, to]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const exportCsv = async () => {
    await Share.share({ message: salesToCsv(vendas, from, to), title: `Extrato de vendas ${from} a ${to}` });
    toast("CSV exportado (partilhar)");
  };

  const exportPdf = async () => {
    try {
      const rows = vendas.map((v) => `<tr><td>#${v.number} — ${fmtDT(v.created_at)}</td><td>${v.client_name || "Consumidor Final"}</td><td style="text-align:right">${fmtMT(v.total)}</td><td style="text-align:right">${fmtMT(v.lucro)}</td><td>${v.status}</td></tr>`).join("");
      const html = `<html><body style="font-family:sans-serif"><h2>Vendas 360 — Extrato de Vendas</h2>
        <p>Período: ${from} a ${to}</p>
        <p><b>Subtotal:</b> ${fmtMT(agg?.subtotal ?? 0)} · <b>Descontos:</b> ${fmtMT(agg?.descontos ?? 0)} · <b>IVA:</b> ${fmtMT(agg?.iva ?? 0)} · <b>Total Geral:</b> ${fmtMT(agg?.total ?? 0)} · <b>Lucro Real:</b> ${fmtMT(agg?.lucro_real ?? 0)}</p>
        <table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse;font-size:11px">
        <tr><th>ID / DATA</th><th>CLIENTE</th><th>TOTAL</th><th>LUCRO</th><th>STATUS</th></tr>${rows}</table></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Share.share({ url: uri, title: "Extrato de vendas (PDF)" });
      toast("PDF gerado (partilhar)");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao gerar PDF", false);
    }
  };

  return (
    <Screen title="Relatórios">
      <Row>
        <Input label="De" value={from} onChangeText={setFrom} placeholder="AAAA-MM-DD" style={{ flex: 1 }} />
        <Input label="Até" value={to} onChangeText={setTo} placeholder="AAAA-MM-DD" style={{ flex: 1 }} />
      </Row>
      <Row>
        <Button variant="ghost" label="CSV" onPress={exportCsv} style={{ flex: 1 }} />
        <Button variant="ghost" label="PDF" onPress={exportPdf} style={{ flex: 1 }} />
      </Row>
      <View style={styles.tabs}>
        <Chip label="Extrato de Vendas" active={tab === "extrato"} onPress={() => setTab("extrato")} />
        <Chip label="Itens Vendidos" active={tab === "itens"} onPress={() => setTab("itens")} />
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Stat label="Subtotal" value={fmtMT(agg?.subtotal ?? 0)} />
        <Stat label="Descontos" value={fmtMT(agg?.descontos ?? 0)} />
        <Stat label="Total IVA (16%)" value={fmtMT(agg?.iva ?? 0)} />
        <Stat label="Total Geral" value={fmtMT(agg?.total ?? 0)} color={COLORS.greenD} />
        <Stat label="Lucro Real" value={fmtMT(agg?.lucro_real ?? 0)} color={COLORS.blue} />
        <Stat label="Ticket Médio" value={`${fmtMT(agg?.ticket_medio ?? 0)} (${agg?.n_vendas ?? 0} vendas)`} />
      </View>

      {tab === "extrato" ? (
        <Card>
          <FlatList
            data={vendas}
            keyExtractor={(v) => String(v.id)}
            scrollEnabled={false}
            renderItem={({ item: v }) => (
              <View style={styles.vrow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>#{v.number} <Badge label={v.status} tone={v.status === "CONCLUIDO" ? "green" : "amber"} /></Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted }}>{fmtDT(v.created_at)} · {v.client_name || "Consumidor Final"}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800" }}>{fmtMT(v.total)}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.blue }}>lucro {fmtMT(v.lucro)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Empty text="Sem vendas no período." />}
          />
        </Card>
      ) : (
        <Card>
          <FlatList
            data={itens}
            keyExtractor={(i) => i.name}
            scrollEnabled={false}
            renderItem={({ item: i }) => (
              <View style={styles.vrow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700" }}>{i.name}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted }}>{i.category ?? ""} · qtd {round2(i.qty)}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "800" }}>{fmtMT(i.total)}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.blue }}>lucro {fmtMT(i.lucro)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Empty text="Sem itens no período." />}
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", marginBottom: 10, borderBottomWidth: 2, borderColor: COLORS.line },
  vrow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: COLORS.line },
});
