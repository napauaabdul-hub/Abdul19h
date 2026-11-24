import React, { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SERVICES } from '../../lib/data/services';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { newId, saveRequest } from '../../lib/storage';
import { colors } from '../../lib/theme';

export default function SolicitarServico() {
  const { servico: servicoId } = useLocalSearchParams<{ servico?: string }>();
  const servico = SERVICES.find((s) => s.id === servicoId);
  const [nome, setNome] = useState('');
  const [contacto, setContacto] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!nome.trim() || !contacto.trim()) {
      Alert.alert('Dados em falta', 'Indique o seu nome e um contacto.');
      return;
    }
    setEnviando(true);
    await saveRequest({
      id: newId(),
      servicoId: servico?.id ?? 'geral',
      servicoTitulo: servico?.titulo ?? 'Serviço geral',
      nome: nome.trim(),
      contacto: contacto.trim(),
      localizacao: localizacao.trim(),
      descricao: descricao.trim(),
      estado: 'Recebido',
      criadoEm: Date.now(),
    });
    setEnviando(false);
    Alert.alert('Pedido enviado', 'O seu pedido foi registado. Pode acompanhar o estado na sua conta.', [
      { text: 'OK', onPress: () => router.push('/(tabs)/conta') },
    ]);
  }

  return (
    <Screen>
      <SetTitle title="Solicitar serviço" />
      <Text style={styles.titulo}>Solicitação de serviço</Text>
      <Text style={styles.sub}>
        {servico ? `Serviço: ${servico.titulo}` : 'Descreva o serviço de que precisa.'}
      </Text>
      <Input label="Nome" value={nome} onChangeText={setNome} placeholder="O seu nome completo" />
      <Input label="Contacto" value={contacto} onChangeText={setContacto} placeholder="Telefone ou WhatsApp" keyboardType="phone-pad" />
      <Input label="Localização da obra" value={localizacao} onChangeText={setLocalizacao} placeholder="Ex.: Matola, bairro..." />
      <Input label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Descreva o trabalho pretendido" multiline />
      <Button label="Enviar pedido" onPress={enviar} loading={enviando} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 14 },
});
