import React from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { openDb } from "../../lib/db.ts";
import { listProducts, listClients, listAccounts, addProduct, addClient, type Product, type Client, type Account } from "../../lib/store.ts";
import { fmtMT, fmtQ } from "../../lib/format.ts";
import { Screen, Card, Button, Input, Row, Empty, COLORS } from "../../components/ui.tsx";
import { useToast } from "../../context/ToastContext.tsx";

export default function CadastrosScreen() {
  const toast = useToast();
  const [prods, setProds] = React.useState<Product[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [prodOpen, setProdOpen] = React.useState(false);
  const [cliOpen, setCliOpen] = React.useState(false);
  const [f, setF] = React.useState({ name: "", category: "Mercearia", sub: "", unit: "un", price: "", cost: "", stock: "0", min: "0", cname: "", cphone: "" });

  const load = React.useCallback(async () => {
    const db = await openDb();
    setProds(await listProducts(db, {}));
    setClients(await listClients(db));
    setAccounts(await listAccounts(db));
  }, []);

  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  const saveProduct = async () => {
    try {
      const db = await openDb();
      await addProduct(db, {
        code: null, name: f.name, category: f.category, subcategory: f.sub || null, unit: f.unit,
        price: parseFloat(f.price || "0"), cost: parseFloat(f.cost || "0"),
        stock: parseFloat(f.stock || "0"), min_stock: parseFloat(f.min || "0"),
      });
      setProdOpen(false);
      toast("Produto criado");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", false);
    }
  };

  const saveClient = async () => {
    try {
      const db = await openDb();
      await addClient(db, f.cname, f.cphone);
      setCliOpen(false);
      toast("Cliente criado");
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro", false);
    }
  };

  return (
    <Screen title="Cadastros">
      <Card>
        <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontWeight: "800" }}>Produtos</Text>
          <Button variant="green" label="＋ Novo Produto" onPress={() => setProdOpen(true)} />
        </Row>
        <FlatList
          data={prods}
          keyExtractor={(p) => String(p.id)}
          scrollEnabled={false}
          style={{ marginTop: 8 }}
          renderItem={({ item: p }) => (
            <Row style={{ justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.line }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", fontSize: 13 }}>{p.name}</Text>
                <Text style={{ fontSize: 11, color: COLORS.muted }}>{p.category}{p.subcategory ? ` · ${p.subcategory}` : ""}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.greenD }}>{fmtMT(p.price)}</Text>
              <Text style={{ fontSize: 12, width: 80, textAlign: "right", color: p.stock <= p.min_stock ? COLORS.red : COLORS.ink }}>{fmtQ(p.stock, p.unit)}</Text>
            </Row>
          )}
        />
      </Card>
      <Row>
        <Card style={{ flex: 1 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "800" }}>Clientes</Text>
            <Button variant="green" label="＋ Novo" onPress={() => setCliOpen(true)} />
          </Row>
          {clients.map((c) => (
            <Row key={c.id} style={{ justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.line }}>
              <Text style={{ fontSize: 13 }}>{c.name}</Text>
              <Text style={{ fontSize: 12, fontWeight: c.debt > 0 ? "800" : "400", color: c.debt > 0 ? COLORS.red : COLORS.ink }}>{c.debt > 0 ? fmtMT(c.debt) : "—"}</Text>
            </Row>
          ))}
          {clients.length === 0 && <Empty text="Sem clientes." />}
        </Card>
        <Card style={{ flex: 1 }}>
          <Text style={{ fontWeight: "800", marginBottom: 6 }}>Contas de Pagamento</Text>
          {accounts.map((a) => (
            <Row key={a.id} style={{ justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderColor: COLORS.line }}>
              <Text style={{ fontSize: 13 }}>{a.name}{a.detail ? <Text style={{ fontSize: 11, color: COLORS.muted }}> ({a.detail})</Text> : null}</Text>
            </Row>
          ))}
        </Card>
      </Row>

      <Modal visible={prodOpen} transparent animationType="slide" onRequestClose={() => setProdOpen(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Novo Produto</Text>
            <Input label="Nome" value={f.name} onChangeText={(t) => setF({ ...f, name: t })} />
            <Row>
              <Input label="Categoria" value={f.category} onChangeText={(t) => setF({ ...f, category: t })} style={{ flex: 1 }} />
              <Input label="Subcategoria" value={f.sub} onChangeText={(t) => setF({ ...f, sub: t })} style={{ flex: 1 }} />
            </Row>
            <Row>
              <Input label="Unidade" value={f.unit} onChangeText={(t) => setF({ ...f, unit: t })} style={{ flex: 1 }} />
              <Input label="Preço (MT)" value={f.price} onChangeText={(t) => setF({ ...f, price: t })} keyboardType="decimal-pad" style={{ flex: 1 }} />
            </Row>
            <Row>
              <Input label="Custo (MT)" value={f.cost} onChangeText={(t) => setF({ ...f, cost: t })} keyboardType="decimal-pad" style={{ flex: 1 }} />
              <Input label="Stock inicial" value={f.stock} onChangeText={(t) => setF({ ...f, stock: t })} keyboardType="decimal-pad" style={{ flex: 1 }} />
            </Row>
            <Row style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" label="Cancelar" onPress={() => setProdOpen(false)} />
              <Button variant="green" label="Guardar" onPress={saveProduct} />
            </Row>
          </View>
        </View>
      </Modal>

      <Modal visible={cliOpen} transparent animationType="slide" onRequestClose={() => setCliOpen(false)}>
        <View style={styles.modalBack}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Novo Cliente</Text>
            <Input label="Nome" value={f.cname} onChangeText={(t) => setF({ ...f, cname: t })} />
            <Input label="Telefone" value={f.cphone} onChangeText={(t) => setF({ ...f, cphone: t })} />
            <Row style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" label="Cancelar" onPress={() => setCliOpen(false)} />
              <Button variant="green" label="Guardar" onPress={saveClient} />
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
});
