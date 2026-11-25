import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { openDb } from "../../lib/db.ts";
import {
  listCategories, listProducts, listSubcategories, listAccounts, listClients, createSale,
  type Product, type Client, type Account, type SaleResult,
} from "../../lib/store.ts";
import { fmtMT, fmtQ, round2 } from "../../lib/format.ts";
import { calcTotals, IVA_RATE } from "../../lib/money.ts";
import { Screen, Card, Button, Chip, Badge, Input, Row, Empty, COLORS } from "../../components/ui.tsx";
import { useToast } from "../../context/ToastContext.tsx";

interface CartItem { product: Product; qty: number }

export default function PdvScreen() {
  const toast = useToast();
  const [categories, setCategories] = React.useState<string[]>([]);
  const [category, setCategory] = React.useState<string>("");
  const [subs, setSubs] = React.useState<string[]>([]);
  const [sub, setSub] = React.useState<string | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [q, setQ] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [client, setClient] = React.useState<Client | null>(null);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [payOpen, setPayOpen] = React.useState(false);
  const [clientOpen, setClientOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<SaleResult | null>(null);
  const [payAccount, setPayAccount] = React.useState<number | null>(null);
  const [fiadoMode, setFiadoMode] = React.useState(false);
  const [payAmt, setPayAmt] = React.useState("");

  const load = React.useCallback(async () => {
    const db = await openDb();
    const cats = await listCategories(db);
    setCategories(cats);
    const cat = category || cats[0] || "";
    if (!category) setCategory(cat);
    const s = await listSubcategories(db, cat);
    setSubs(s);
    setProducts(await listProducts(db, { q: q || undefined, category: cat, sub: sub ?? undefined }));
    setAccounts(await listAccounts(db));
  }, [category, q, sub]);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const addToCart = (p: Product) => {
    setCart((c) => {
      const f = c.find((i) => i.product.id === p.id);
      if (f) return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, qty: 1 }];
    });
  };

  const subtotal = cart.reduce((s, i) => s + i.qty * i.product.price, 0);
  const totals = calcTotals(subtotal, 0);

  const openPay = () => {
    setPayAccount(accounts[0]?.id ?? null);
    setFiadoMode(false);
    setPayAmt(totals.total.toFixed(2));
    setPayOpen(true);
  };

  const confirmSale = async () => {
    try {
      const db = await openDb();
      const payments = [];
      const amt = parseFloat(payAmt || "0");
      if (fiadoMode) {
        if (!client) return toast("Fiado exige um cliente selecionado", false);
        if (amt > 0) payments.push({ account_id: accounts[0].id, amount: amt });
      } else {
        if (!(amt > 0)) return toast("Informe o valor pago", false);
        if (!payAccount) return toast("Escolha a conta", false);
        payments.push({ account_id: payAccount, amount: amt });
      }
      const r = await createSale(db, {
        items: cart.map((i) => ({ product_id: i.product.id, qty: i.qty })),
        client_id: client?.id ?? null,
        payments,
      });
      setPayOpen(false);
      setReceipt(r);
      setCart([]);
      setClient(null);
      load();
      toast(`Venda #${r.number} registada — ${fmtMT(r.total)}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro na venda", false);
    }
  };

  return (
    <Screen title="PDV — Comidas & Produtos">
      <Input placeholder="Procurar produto..." value={q} onChangeText={setQ} />
      <View style={styles.wrap}>
        <Chip label="Todas" active={sub === null && false} onPress={() => setSub(null)} />
        {subs.map((s) => <Chip key={s} label={s} active={sub === s} onPress={() => setSub(s === sub ? null : s)} />)}
      </View>
      <View style={styles.wrap}>
        {categories.map((c) => <Chip key={c} label={c} active={c === category} onPress={() => { setCategory(c); setSub(null); }} />)}
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        scrollEnabled={false}
        renderItem={({ item: p }) => (
          <Pressable style={styles.prod} onPress={() => addToCart(p)}>
            <Text style={styles.pname}>{p.name}</Text>
            <Text style={[styles.pstock, p.stock <= p.min_stock && { color: COLORS.red, fontWeight: "700" }]}>
              {fmtQ(p.stock, p.unit)}{p.stock <= p.min_stock ? " — baixo!" : ""}
            </Text>
            <Text style={styles.pprice}>{fmtMT(p.price)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Empty text="Sem produtos nesta categoria." />}
      />

      <Card style={{ marginTop: 12 }}>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "800", fontSize: 15 }}>Caixa — a mesma venda continua</Text>
          <Badge label={`${cart.reduce((s, i) => s + i.qty, 0)} itens`} tone="green" />
        </Row>
        {cart.map((i, idx) => (
          <Row key={i.product.id} style={{ alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.line }}>
            <Text style={{ flex: 1, fontSize: 13 }}>{i.product.name}</Text>
            <Pressable onPress={() => setCart((c) => c.map((x, j) => (j === idx ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0))} style={styles.qbtn}><Text style={{ fontWeight: "800" }}>−</Text></Pressable>
            <Text style={{ width: 26, textAlign: "center", fontWeight: "700" }}>{i.qty}</Text>
            <Pressable onPress={() => setCart((c) => c.map((x, j) => (j === idx ? { ...x, qty: x.qty + 1 } : x)))} style={styles.qbtn}><Text style={{ fontWeight: "800" }}>+</Text></Pressable>
            <Text style={{ width: 90, textAlign: "right", fontWeight: "700" }}>{fmtMT(i.qty * i.product.price)}</Text>
          </Row>
        ))}
        {cart.length === 0 && <Empty text="Carrinho vazio — toque num produto." />}
        <Text style={{ fontSize: 21, fontWeight: "800", textAlign: "right", marginTop: 8 }}>{fmtMT(totals.total)}</Text>
        <Text style={{ fontSize: 11, color: COLORS.muted, textAlign: "right" }}>
          Subtotal {fmtMT(totals.subtotal)} · IVA ({Math.round(IVA_RATE * 100)}%) {fmtMT(totals.iva)}
        </Text>
        <Button variant="ghost" label={client ? `👤 ${client.name}${client.debt > 0 ? ` (dívida ${fmtMT(client.debt)})` : ""}` : "👤 Buscar Clientes"} onPress={async () => setClientOpen(true)} style={{ marginTop: 8 }} />
        <Button variant="green" label="💳 Finalizar Venda" onPress={openPay} disabled={cart.length === 0} style={{ marginTop: 8 }} />
      </Card>

      <Modal visible={payOpen} transparent animationType="slide" onRequestClose={() => setPayOpen(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pagamento</Text>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>{fmtMT(totals.total)}</Text>
            <Text style={styles.lbl}>Forma de pagamento / Conta destino</Text>
            <View style={styles.wrap}>
              {accounts.map((a) => (
                <Chip key={a.id} label={`${a.name}${a.detail ? ` (${a.detail})` : ""}`} active={!fiadoMode && payAccount === a.id} onPress={() => { setPayAccount(a.id); setFiadoMode(false); }} />
              ))}
              <Chip label="📒 Fiado (cliente)" active={fiadoMode} onPress={() => setFiadoMode(true)} />
            </View>
            <Input label="Valor pago (MT)" value={payAmt} onChangeText={setPayAmt} keyboardType="decimal-pad" />
            {fiadoMode && <Text style={styles.lbl}>O restante vai para fiado do cliente</Text>}
            <Row style={{ justifyContent: "flex-end", marginTop: 6 }}>
              <Button variant="ghost" label="Cancelar" onPress={() => setPayOpen(false)} />
              <Button variant="green" label="Confirmar Venda" onPress={confirmSale} />
            </Row>
          </View>
        </View>
      </Modal>

      <Modal visible={clientOpen} transparent animationType="slide" onRequestClose={() => setClientOpen(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Buscar Clientes</Text>
            <ClientPicker onPick={(c) => { setClient(c); setClientOpen(false); }} onClose={() => setClientOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={receipt !== null} transparent animationType="slide" onRequestClose={() => setReceipt(null)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            {receipt && (
              <>
                <Text style={[styles.modalTitle, { textAlign: "center" }]}>VENDAS 360</Text>
                <Row style={{ justifyContent: "space-between" }}><Text>Venda</Text><Text style={{ fontWeight: "800" }}>#{receipt.number}</Text></Row>
                <Row style={{ justifyContent: "space-between" }}>
                  <Text>Status</Text>
                  <Text style={{ fontWeight: "800" }}>{receipt.fiado > 0 ? `PARCIAL (fiado ${fmtMT(receipt.fiado)})` : "CONCLUÍDO"}</Text>
                </Row>
                <Row style={{ justifyContent: "space-between" }}><Text>Total</Text><Text style={{ fontWeight: "800" }}>{fmtMT(receipt.total)}</Text></Row>
                <Row style={{ justifyContent: "space-between" }}><Text>Pago</Text><Text style={{ fontWeight: "800" }}>{fmtMT(receipt.pago)}</Text></Row>
                {receipt.fiado > 0 && (
                  <Row style={{ justifyContent: "space-between" }}><Text>Fiado (fatura #{receipt.invoice?.number})</Text><Text style={{ fontWeight: "800" }}>{fmtMT(receipt.fiado)}</Text></Row>
                )}
                <Text style={{ textAlign: "center", color: COLORS.muted, marginVertical: 10 }}>Obrigado pela preferência!</Text>
                <Button variant="green" label="Nova venda" onPress={() => setReceipt(null)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function ClientPicker({ onPick, onClose }: { onPick: (c: Client) => void; onClose: () => void }) {
  const [q, setQ] = React.useState("");
  const [list, setList] = React.useState<Client[]>([]);
  React.useEffect(() => {
    (async () => {
      const db = await openDb();
      setList(await listClients(db, q));
    })();
  }, [q]);
  return (
    <>
      <Input placeholder="Procurar cliente..." value={q} onChangeText={setQ} />
      <FlatList
        data={list}
        keyExtractor={(c) => String(c.id)}
        style={{ maxHeight: 320 }}
        renderItem={({ item: c }) => (
          <Pressable style={styles.clientRow} onPress={() => onPick(c)}>
            <View><Text style={{ fontWeight: "700" }}>{c.name}</Text><Text style={{ fontSize: 11, color: COLORS.muted }}>{c.phone || ""}</Text></View>
            <Text style={{ fontWeight: "800", color: c.debt > 0 ? COLORS.red : COLORS.ink }}>{c.debt > 0 ? fmtMT(c.debt) : "0,00 MT"}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Empty text="Nenhum cliente." />}
      />
      <Button variant="ghost" label="Fechar" onPress={onClose} style={{ marginTop: 8 }} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  prod: { flex: 1, minWidth: 140, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, padding: 10, marginBottom: 10 },
  pname: { fontWeight: "600", fontSize: 13, minHeight: 32 },
  pstock: { fontSize: 11, color: COLORS.muted },
  pprice: { fontWeight: "800", color: COLORS.greenD, marginTop: 4 },
  qbtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  modalBack: { flex: 1, backgroundColor: "rgba(15,23,42,.55)", justifyContent: "center", padding: 18 },
  modal: { backgroundColor: "#fff", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  lbl: { fontSize: 12, color: COLORS.muted, marginBottom: 6, marginTop: 6 },
  clientRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10, borderRadius: 10 },
});
