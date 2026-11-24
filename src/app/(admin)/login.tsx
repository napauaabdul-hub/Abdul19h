import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { getAdmins, hashSenha, setAdminSession } from '../../lib/storage';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { colors } from '../../lib/theme';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar() {
    if (!email.trim() || !senha) return;
    setLoading(true);
    const admins = await getAdmins();
    const admin = admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    setLoading(false);
    if (!admin || admin.senhaHash !== hashSenha(senha)) {
      Alert.alert('Acesso negado', 'Email ou palavra-passe de administrador incorretos.');
      return;
    }
    await setAdminSession({ adminId: admin.id });
    router.replace('/(admin)');
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Logo size={48} />
        <Text style={styles.titulo}>Painel administrativo</Text>
        <Text style={styles.sub}>
          Acesso restrito ao proprietário. Conta inicial: admin@napauabuild.mz / admin123 (altere depois no código ou
          na base de dados).
        </Text>
      </View>
      <Input label="Email do administrador" value={email} onChangeText={setEmail} placeholder="admin@napauabuild.mz" keyboardType="email-address" />
      <Input label="Palavra-passe" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />
      <Button label="Entrar no painel" onPress={entrar} loading={loading} disabled={!email.trim() || !senha} />
      <View style={{ height: 12 }} />
      <Button label="Voltar ao app" variant="ghost" onPress={() => router.push('/(tabs)')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 24, justifyContent: 'center' },
  top: { marginBottom: 24 },
  titulo: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 12 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 18 },
});
