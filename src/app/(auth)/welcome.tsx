import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../../context/auth';
import { Button } from '../../components/Button';
import { colors } from '../../lib/theme';

export default function Welcome() {
  const { state, explore } = useAuth();
  if (state.status === 'user' || state.status === 'guest') return <Redirect href="/(tabs)" />;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Image source={require('../../../assets/splash-icon.png')} style={styles.logo} />
        <Text style={styles.nome}>
          Constrói <Text style={{ color: colors.orange }}>Fácil</Text>
        </Text>
        <Text style={styles.tagline}>Planeie melhor. Calcule os materiais. Construa com confiança.</Text>
        <Text style={styles.desc}>
          Calculadora inteligente de materiais de construção, plantas de casas, orçamentos em Meticais e serviços
          profissionais — 100% gratuito, em Moçambique.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="Entrar" onPress={() => router.push('/(auth)/login')} />
        <View style={{ height: 10 }} />
        <Button label="Criar conta" variant="teal" onPress={() => router.push('/(auth)/register')} />
        <View style={{ height: 10 }} />
        <Button label="Explorar sem conta" variant="ghost" onPress={explore} />
      </View>
      <Text style={styles.gratis}>Gratuito para todos os utilizadores · Moeda: Metical (MT)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 32 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 140, height: 140, borderRadius: 32, marginBottom: 16 },
  nome: { fontSize: 34, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 15, fontWeight: '700', color: colors.teal, marginTop: 10, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 20, maxWidth: 320 },
  actions: { width: '100%' },
  gratis: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 14 },
});
