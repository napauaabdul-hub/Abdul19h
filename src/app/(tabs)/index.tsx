import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth';
import { Logo } from '../../components/Logo';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { Stars } from '../../components/Stars';
import { getServices } from '../../lib/catalog';
import { Service } from '../../lib/types';
import { colors, radius, shadow } from '../../lib/theme';

const CATEGORIAS = [
  { titulo: 'Calculadora', icon: 'calculator', rota: '/(tabs)/calculadora' },
  { titulo: 'Construção de casas', icon: 'home', rota: '/servicos/construcao-casas' },
  { titulo: 'Blocos', icon: 'cube', rota: '/servicos/fornecimento-blocos' },
  { titulo: 'Vigotas e abobadilhas', icon: 'layers', rota: '/servicos/vigotas-abobadilhas' },
  { titulo: 'Plantas', icon: 'pencil-ruler', rota: '/plantas' },
  { titulo: 'Orçamentos', icon: 'document-text', rota: '/(tabs)/orcamentos' },
] as const;

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const [pesquisa, setPesquisa] = useState('');
  const [recomendados, setRecomendados] = useState<Service[]>([]);
  const nome = state.status === 'user' ? state.user.nome.split(' ')[0] : null;

  useEffect(() => {
    getServices().then((s) => setRecomendados(s.slice(0, 4)));
  }, []);

  return (
    <ScrollView style={[styles.root, { paddingTop: insets.top }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Logo size={38} />
        <View style={styles.headerRight}>
          <View style={styles.local}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.localText}>Maputo, MZ</Text>
          </View>
          <Pressable style={styles.bell} onPress={() => router.push('/notificacoes')}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.saudacao}>{saudacao()}, {nome ?? 'construtor'}! 👋</Text>

      <Pressable style={styles.search} onPress={() => router.push('/busca')}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={pesquisa}
          onChangeText={setPesquisa}
          placeholder="Pesquisar serviços, materiais, plantas, orçamentos..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          onSubmitEditing={() => router.push({ pathname: '/busca', params: { q: pesquisa } })}
        />
      </Pressable>

      <View style={styles.banner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>
            Vai construir a sua casa? Descubra quanto material precisa com a NAPAUA BUILD!
          </Text>
          <View style={styles.bannerBtns}>
            <Pressable style={styles.bannerBtnPrimary} onPress={() => router.push('/(tabs)/calculadora')}>
              <Text style={styles.bannerBtnPrimaryText}>CALCULAR MATERIAIS</Text>
            </Pressable>
            <Pressable style={styles.bannerBtnSecondary} onPress={() => router.push('/orcamentos/novo')}>
              <Text style={styles.bannerBtnSecondaryText}>Solicitar orçamento</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.bannerIcon}>
          <Ionicons name="hammer" size={34} color={colors.primary} />
        </View>
      </View>

      <View style={{ height: 18 }} />
      <SectionHeader title="Categorias" />
      <View style={styles.grid}>
        {CATEGORIAS.map((c) => (
          <Pressable key={c.titulo} style={styles.cat} onPress={() => router.push(c.rota as never)}>
            <View style={styles.catIcon}>
              <Ionicons name={c.icon as never} size={24} color={colors.accent} />
            </View>
            <Text style={styles.catText}>{c.titulo}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 18 }} />
      <SectionHeader
        title="Serviços recomendados"
        action="Ver todos"
        onAction={() => router.push('/(tabs)/servicos')}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
        {recomendados.map((s) => (
          <Card key={s.id} onPress={() => router.push(`/servicos/${s.id}`)} style={styles.svc}>
            <View style={styles.svcIcon}>
              <Ionicons name={s.icon as never} size={26} color={colors.white} />
            </View>
            <Text style={styles.svcTitle} numberOfLines={2}>{s.titulo}</Text>
            <Stars rating={s.rating} />
            <Text style={styles.svcReviews}>({s.avaliacoes} avaliações)</Text>
            <Text style={styles.svcPrice} numberOfLines={1}>{s.precoReferencia}</Text>
            <View style={styles.svcContact}>
              <Ionicons name="logo-whatsapp" size={14} color={colors.accent} />
              <Text style={styles.svcContactText}>WhatsApp</Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      <View style={{ height: 8 }} />
      <Card style={styles.free}>
        <Ionicons name="shield-checkmark" size={22} color={colors.orange} />
        <Text style={styles.freeText}>
          100% gratuito — sem mensalidades, sem taxas e sem funcionalidades bloqueadas.
        </Text>
      </Card>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  local: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  localText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  bell: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  saudacao: { fontSize: 20, fontWeight: '800', color: colors.text, paddingHorizontal: 16, marginTop: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    height: 46,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.tint,
    borderRadius: radius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#BFE3EC',
  },
  bannerTitle: { color: colors.text, fontSize: 15, fontWeight: '800', lineHeight: 21 },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  bannerBtns: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  bannerBtnPrimary: { backgroundColor: colors.orange, borderRadius: radius.pill, paddingHorizontal: 14, height: 38, justifyContent: 'center' },
  bannerBtnPrimaryText: { color: colors.white, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  bannerBtnSecondary: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerBtnSecondaryText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 4 },
  cat: { width: '31.5%', margin: 4, paddingVertical: 12, alignItems: 'center' },
  catIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catText: { fontSize: 12, fontWeight: '700', color: colors.text, textAlign: 'center' },
  svc: { width: 170, borderWidth: 1, borderColor: colors.border, shadowColor: 'transparent', elevation: 0 },
  svcIcon: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  svcTitle: { fontSize: 14, fontWeight: '800', color: colors.text, minHeight: 36 },
  svcReviews: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  svcPrice: { fontSize: 12, color: colors.orange, fontWeight: '700', marginTop: 4 },
  svcContact: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  svcContactText: { fontSize: 12, color: colors.accent, fontWeight: '700' },
  free: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.tint, borderWidth: 1, borderColor: '#BFE3EC', shadowColor: 'transparent', elevation: 0 },
  freeText: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600', lineHeight: 18 },
});
