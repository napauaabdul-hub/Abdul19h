import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { getObras, newId, saveObras } from '../../lib/storage';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { colors } from '../../lib/theme';

export default function NovaObra() {
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [cliente, setCliente] = useState('');

  async function criar() {
    if (!nome.trim() || !local.trim()) {
      Alert.alert('Dados em falta', 'Indique o nome e o local da obra.');
      return;
    }
    const all = await getObras();
    await saveObras([
      { id: newId(), nome: nome.trim(), local: local.trim(), cliente: cliente.trim(), iniciadoEm: Date.now(), etapasFeitas: [] },
      ...all,
    ]);
    router.replace('/obras');
  }

  return (
    <Screen>
      <SetTitle title="Nova obra" />
      <Text style={styles.titulo}>Registar obra</Text>
      <Input label="Nome da obra" value={nome} onChangeText={setNome} placeholder="Ex.: Casa da minha mãe" />
      <Input label="Local" value={local} onChangeText={setLocal} placeholder="Ex.: Matola, bairro..." />
      <Input label="Cliente (opcional)" value={cliente} onChangeText={setCliente} placeholder="Nome do dono da obra" />
      <Button label="Criar obra" onPress={criar} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 14 },
});
