import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SERVICES } from '../../lib/data/services';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { Stars } from '../../components/Stars';
import { colors, radius } from '../../lib/theme';

export default function ServicoDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const servico = SERVICES.find((s) => s.id === id);

  if (!servico) {
    return (
      <Screen>
        <SetTitle title="Serviço" />
        <Text style={{ color: colors.textMuted }}>Serviço não encontrado.</Text>
      </Screen>
    );
  }
  const sv = servico;

  async function whatsapp() {
    await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(`Olá! Quero solicitar o serviço: ${sv.titulo}.`)}`);
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }}>
      <SetTitle title={servico.titulo} />
      <View style={styles.banner}>
        <Ionicons name={sv.icon as never} size={54} color={colors.accent} />
      </View>
      <Text style={styles.titulo}>{servico.titulo}</Text>
      <View style={styles.catRow}>
        <View style={styles.catChip}>
          <Text style={styles.catText}>{servico.categoria}</Text>
        </View>
        <View style={styles.precoChip}>
          <Text style={styles.precoText}>{servico.precoReferencia}</Text>
        </View>
      </View>
      <View style={styles.ratingRow}>
        <Stars rating={servico.rating} size={16} />
        <Text style={styles.ratingText}>{servico.avaliacoes} avaliações de clientes</Text>
      </View>
      <Text style={styles.desc}>{servico.descricao}</Text>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Características</Text>
        {servico.destaques.map((d) => (
          <View key={d} style={styles.destaque}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.destaqueText}>{d}</Text>
          </View>
        ))}
      </Card>
      <Button label="Solicitar serviço" onPress={() => router.push({ pathname: '/servicos/solicitar', params: { servico: servico.id } })} />
      <View style={{ height: 10 }} />
      <Button label="Contactar pelo WhatsApp" variant="teal" onPress={whatsapp} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  banner: {
    height: 140,
    borderRadius: radius.xl,
    backgroundColor: colors.tint,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ratingText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  catRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  catChip: { backgroundColor: colors.gray, borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: 'center' },
  catText: { fontSize: 12, fontWeight: '700', color: colors.teal },
  precoChip: { backgroundColor: '#FDEBDD', borderRadius: 999, paddingHorizontal: 12, height: 30, justifyContent: 'center' },
  precoText: { fontSize: 12, fontWeight: '800', color: colors.orange },
  desc: { fontSize: 14, color: colors.text, lineHeight: 21, marginTop: 12 },
  card: { marginTop: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 },
  destaque: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  destaqueText: { fontSize: 14, color: colors.text },
});
