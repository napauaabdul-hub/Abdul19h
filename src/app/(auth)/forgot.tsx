import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Logo } from '../../components/Logo';
import { colors } from '../../lib/theme';

export default function Forgot() {
  const { recover } = useAuth();
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function recuperar() {
    if (!valor.trim()) return;
    setLoading(true);
    const res = await recover(valor);
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Conta não encontrada', res.erro);
      return;
    }
    setEnviado(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Logo size={44} />
        <Text style={styles.titulo}>Recuperar acesso</Text>
        <Text style={styles.sub}>
          {enviado
            ? 'Enviámos instruções de recuperação para o email ou SMS associado à sua conta. Depois de repor a palavra-passe, volte a entrar.'
            : 'Indique o email ou o número de telefone usados no registo.'}
        </Text>
      </View>
      {!enviado && (
        <>
          <Input
            label="Email ou telefone"
            value={valor}
            onChangeText={setValor}
            placeholder="nome@email.com ou +258 8X XXX XXXX"
            keyboardType="email-address"
          />
          <Button label="Enviar instruções" onPress={recuperar} loading={loading} disabled={!valor.trim()} />
        </>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerText} onPress={() => router.back()}>
          Voltar ao início de sessão
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 24, justifyContent: 'center' },
  top: { marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: 12 },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 4, lineHeight: 20 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
