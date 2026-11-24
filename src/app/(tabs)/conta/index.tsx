import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/auth';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Logo } from '../../../components/Logo';
import { getBudgetRequests, getProjects, getRequests, getSavedPlans } from '../../../lib/storage';
import { colors, radius } from '../../../lib/theme';

interface Linha {
  icon: string;
  titulo: string;
  detalhe?: string;
  onPress: () => void;
}

export default function Conta() {
  const { state, logout } = useAuth();
  const [contagens, setContagens] = useState({ projetos: 0, orcamentos: 0, pedidos: 0, plantas: 0 });

  useFocusEffect(
    useCallback(() => {
      Promise.all([getProjects(), getBudgetRequests(), getRequests(), getSavedPlans()]).then(
        ([p, o, r, pl]) => setContagens({ projetos: p.length, orcamentos: o.length, pedidos: r.length, plantas: pl.length }),
      );
    }, []),
  );

  const user = state.status === 'user' ? state.user : null;

  const linhas: Linha[] = [
    { icon: 'calculator-outline', titulo: 'Histórico de cálculos', detalhe: `${contagens.projetos} projeto(s)`, onPress: () => router.push('/(tabs)/calculadora') },
    { icon: 'folder-outline', titulo: 'Projetos guardados', detalhe: `${contagens.projetos}`, onPress: () => router.push('/(tabs)/calculadora') },
    { icon: 'document-text-outline', titulo: 'Pedidos de orçamento', detalhe: `${contagens.orcamentos}`, onPress: () => router.push('/(tabs)/orcamentos') },
    { icon: 'briefcase-outline', titulo: 'Serviços solicitados', detalhe: `${contagens.pedidos}`, onPress: () => router.push('/(tabs)/servicos') },
    { icon: 'pencil-ruler-outline', titulo: 'Plantas guardadas', detalhe: `${contagens.plantas}`, onPress: () => router.push('/plantas') },
    { icon: 'notifications-outline', titulo: 'Notificações', onPress: () => router.push('/notificacoes') },
    { icon: 'key-outline', titulo: 'Recuperar acesso', onPress: () => router.push('/(auth)/forgot') },
  ];

  function terminar() {
    Alert.alert('Terminar sessão', 'Quer sair da sua conta neste dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Terminar sessão', style: 'destructive', onPress: logout },
    ]);
  }

  if (!user) {
    return (
      <View style={styles.root}>
        <View style={styles.guest}>
          <Logo size={48} />
          <Text style={styles.guestTitle}>Está a explorar sem conta</Text>
          <Text style={styles.guestText}>
            Crie uma conta gratuita para guardar os seus cálculos, orçamentos e pedidos neste dispositivo.
          </Text>
          <Button label="Criar conta" onPress={() => router.push('/(auth)/register')} />
          <View style={{ height: 10 }} />
          <Button label="Entrar" variant="outline" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Card style={styles.perfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.nome.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{user.nome}</Text>
          <Text style={styles.dado}>{user.telefone}</Text>
          <Text style={styles.dado}>{user.email}</Text>
        </View>
      </Card>
      <Card style={styles.menu}>
        {linhas.map((l, i) => (
          <Pressable
            key={l.titulo}
            style={[styles.linha, i > 0 && styles.linhaTop]}
            onPress={l.onPress}
          >
            <Ionicons name={l.icon as never} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linhaTitulo}>{l.titulo}</Text>
              {l.detalhe ? <Text style={styles.linhaDetalhe}>{l.detalhe}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>
      <Button label="Terminar sessão" variant="ghost" onPress={terminar} />
      <Text style={styles.versao}>Constrói Fácil v1.0.0 · 100% gratuito · Moçambique · MT</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray, padding: 16 },
  guest: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  guestTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 16 },
  guestText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 20, maxWidth: 300 },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 24, fontWeight: '800' },
  nome: { fontSize: 17, fontWeight: '800', color: colors.text },
  dado: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  menu: { padding: 4, marginBottom: 12 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12 },
  linhaTop: { borderTopWidth: 1, borderTopColor: colors.border },
  linhaTitulo: { fontSize: 14, fontWeight: '700', color: colors.text },
  linhaDetalhe: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  versao: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: 8 },
});
