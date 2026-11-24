import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlans, getServices } from '../../lib/catalog';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { getBudgetRequests, getRequests, getUsers, setAdminSession } from '../../lib/storage';
import { colors, radius, shadow } from '../../lib/theme';

export default function AdminHome() {
  const [stats, setStats] = useState({ servicos: 0, plantas: 0, pedidos: 0, utilizadores: 0 });

  useFocusEffect(
    useCallback(() => {
      Promise.all([getServices(), getPlans(), getRequests(), getBudgetRequests(), getUsers()]).then(
        ([s, p, r, b, u]) => setStats({ servicos: s.length, plantas: p.length, pedidos: r.length + b.length, utilizadores: u.length }),
      );
    }, []),
  );

  const itens = [
    { icon: 'briefcase', titulo: 'Serviços', sub: `${stats.servicos} publicados`, rota: '/(admin)/servicos' },
    { icon: 'pricetag', titulo: 'Materiais e preços', sub: 'Preços de referência em MT', rota: '/(admin)/precos' },
    { icon: 'calculator', titulo: 'Parâmetros da calculadora', sub: 'Fórmulas e desperdícios', rota: '/(admin)/parametros' },
    { icon: 'pencil-ruler', titulo: 'Plantas', sub: `${stats.plantas} publicadas`, rota: '/(admin)/plantas' },
    { icon: 'document-text', titulo: 'Pedidos', sub: `${stats.pedidos} reçus`, rota: '/(admin)/pedidos' },
    { icon: 'people', titulo: 'Utilizadores', sub: `${stats.utilizadores} contas`, rota: '/(admin)/utilizadores' },
  ] as const;

  async function sair() {
    await setAdminSession(null);
    router.replace('/(admin)/login');
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Ionicons name="shield-checkmark" size={34} color={colors.white} />
        <Text style={styles.heroTitle}>NAPAUA BUILD — Administração</Text>
        <Text style={styles.heroText}>Controlo de serviços, materiais e preços, fórmulas da calculadora, plantas, pedidos e utilizadores.</Text>
      </View>
      <View style={styles.grid}>
        {itens.map((i) => (
          <Card key={i.titulo} onPress={() => router.push(i.rota as never)} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={i.icon as never} size={24} color={colors.accent} />
            </View>
            <Text style={styles.titulo}>{i.titulo}</Text>
            <Text style={styles.sub}>{i.sub}</Text>
          </Card>
        ))}
      </View>
      <Button label="Terminar sessão de administrador" variant="ghost" onPress={sair} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, marginBottom: 16, ...shadow.card },
  heroTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginTop: 10 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', flexGrow: 1 },
  icon: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
