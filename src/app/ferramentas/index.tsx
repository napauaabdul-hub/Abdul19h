import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { QUICK_CALCS } from '../../lib/quickcalc';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { colors, radius, shadow } from '../../lib/theme';

const EXTRAS = [
  { id: 'comparador', titulo: 'Comparação de preços', icon: 'git-compare', descricao: 'Compare o mesmo material em várias lojas', rota: '/comparador' },
  { id: 'fornecedores', titulo: 'Fornecedores', icon: 'location', descricao: 'Lojas de materiais perto de si em Maputo', rota: '/fornecedores' },
  { id: 'obras', titulo: 'Acompanhamento de obras', icon: 'clipboard', descricao: 'Etapas concluídas da sua obra', rota: '/obras' },
  { id: 'galeria', titulo: 'Obras concluídas', icon: 'images', descricao: 'Galeria de trabalhos realizados', rota: '/galeria' },
] as const;

export default function Ferramentas() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <Ionicons name="construct" size={32} color={colors.white} />
        <Text style={styles.heroTitle}>Ferramentas de obra</Text>
        <Text style={styles.heroText}>Calculadoras dedicadas por especialidade, todas com fórmulas verificáveis.</Text>
      </View>
      <SectionHeader title="Calculadoras dedicadas" />
      <View style={styles.grid}>
        {QUICK_CALCS.map((q) => (
          <Card key={q.id} onPress={() => router.push(`/ferramentas/${q.id}`)} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={q.icon as never} size={24} color={colors.accent} />
            </View>
            <Text style={styles.titulo}>{q.titulo}</Text>
            <Text style={styles.desc} numberOfLines={2}>{q.descricao}</Text>
          </Card>
        ))}
      </View>
      <SectionHeader title="Mais ferramentas" />
      <View style={styles.grid}>
        {EXTRAS.map((e) => (
          <Card key={e.id} onPress={() => router.push(e.rota as never)} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={e.icon as never} size={24} color={colors.orange} />
            </View>
            <Text style={styles.titulo}>{e.titulo}</Text>
            <Text style={styles.desc} numberOfLines={2}>{e.descricao}</Text>
          </Card>
        ))}
      </View>
      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, marginBottom: 14, ...shadow.card },
  heroTitle: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: 10 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', flexGrow: 1 },
  icon: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 16 },
});
