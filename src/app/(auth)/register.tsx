import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { colors } from '../../lib/theme';

export default function Register() {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function criar() {
    setLoading(true);
    const res = await register({ nome, telefone, email, senha });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Não foi possível criar a conta', res.erro);
      return;
    }
    router.replace('/(tabs)');
  }

  const valido = nome.trim() && telefone.trim() && email.trim() && senha.length >= 6;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.top}>
        <Logo size={44} />
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.sub}>Gratuita e rápida. Os seus projectos ficam guardados neste dispositivo.</Text>
      </View>
      <Input label="Nome completo" value={nome} onChangeText={setNome} placeholder="O seu nome" />
      <Input label="Número de telefone" value={telefone} onChangeText={setTelefone} placeholder="+258 8X XXX XXXX" keyboardType="phone-pad" />
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="nome@email.com" keyboardType="email-address" />
      <Input
        label="Palavra-passe"
        value={senha}
        onChangeText={setSenha}
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        hint="A palavra-passe é guardada apenas neste dispositivo, de forma cifrada."
      />
      <Button label="Criar conta" onPress={criar} loading={loading} disabled={!valido} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Já tem conta? </Text>
        <Link href="/(auth)/login" style={styles.link}>
          Entrar
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  top: { marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 12 },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.textMuted, fontSize: 14 },
});
