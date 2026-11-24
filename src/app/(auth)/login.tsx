import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { colors } from '../../lib/theme';

export default function Login() {
  const { login } = useAuth();
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!identificador.trim() || !senha) return;
    setLoading(true);
    const res = await login(identificador, senha);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Não foi possível entrar', res.erro);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Logo size={44} />
        <Text style={styles.titulo}>Entrar</Text>
        <Text style={styles.sub}>Aceda com o seu número de telefone ou email.</Text>
      </View>
      <Input
        label="Telefone ou email"
        value={identificador}
        onChangeText={setIdentificador}
        placeholder="Ex.: +258 84 000 0000 ou nome@email.com"
        keyboardType="email-address"
      />
      <Input
        label="Palavra-passe"
        value={senha}
        onChangeText={setSenha}
        placeholder="A sua palavra-passe"
        secureTextEntry
      />
      <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
        <Link href="/(auth)/forgot" style={styles.link}>
          Esqueci a palavra-passe
        </Link>
      </View>
      <Button label="Entrar" onPress={entrar} loading={loading} disabled={!identificador.trim() || !senha} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ainda não tem conta? </Text>
        <Link href="/(auth)/register" style={styles.link}>
          Criar conta
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 24, justifyContent: 'center' },
  top: { marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 12 },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.textMuted, fontSize: 14 },
});
