import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { newId, saveBudgetRequest } from '../../lib/storage';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

const TIPOS = ['Casa completa', 'Fundação', 'Laje', 'Alvenaria', 'Cobertura', 'Acabamentos'];
const COBERTURAS = ['Laje', 'Chapas', 'Telhas'];

export default function NovoOrcamento() {
  const [nome, setNome] = useState('');
  const [contacto, setContacto] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [area, setArea] = useState('');
  const [pisos, setPisos] = useState('1');
  const [cobertura, setCobertura] = useState(COBERTURAS[1]);
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!nome.trim() || !contacto.trim()) {
      Alert.alert('Dados em falta', 'Indique o seu nome e um contacto.');
      return;
    }
    setEnviando(true);
    await saveBudgetRequest({
      id: newId(),
      nome: nome.trim(),
      contacto: contacto.trim(),
      localizacao: localizacao.trim(),
      tipo,
      area: parseNumber(area),
      pisos: parseNumber(pisos) || 1,
      cobertura,
      descricao: descricao.trim(),
      estado: 'Recebido',
      criadoEm: Date.now(),
    });
    setEnviando(false);
    Alert.alert('Pedido enviado', 'O seu pedido de orçamento foi registado. Receberá o orçamento em PDF e Excel.', [
      { text: 'OK', onPress: () => router.push('/(tabs)/orcamentos') },
    ]);
  }

  return (
    <Screen>
      <SetTitle title="Novo orçamento" />
      <Text style={styles.titulo}>Solicitar orçamento</Text>
      <Text style={styles.sub}>Preencha os dados da obra. O resultado é disponibilizado em PDF e Excel.</Text>
      <Input label="Nome" value={nome} onChangeText={setNome} placeholder="O seu nome completo" />
      <Input label="Contacto" value={contacto} onChangeText={setContacto} placeholder="Telefone ou WhatsApp" keyboardType="phone-pad" />
      <Input label="Localização" value={localizacao} onChangeText={setLocalizacao} placeholder="Ex.: Maputo, bairro..." />
      <Text style={styles.group}>Tipo de orçamento</Text>
      <View style={styles.chips}>
        {TIPOS.map((t) => (
          <Chip key={t} label={t} selected={tipo === t} onPress={() => setTipo(t)} />
        ))}
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Área (m²)" value={area} onChangeText={setArea} placeholder="Ex.: 81" keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Pisos" value={pisos} onChangeText={setPisos} keyboardType="number-pad" />
        </View>
      </View>
      <Text style={styles.group}>Cobertura</Text>
      <View style={styles.chips}>
        {COBERTURAS.map((c) => (
          <Chip key={c} label={c} selected={cobertura === c} onPress={() => setCobertura(c)} />
        ))}
      </View>
      <Input label="Descrição / planta" value={descricao} onChangeText={setDescricao} placeholder="Descreva a obra ou anexe detalhes" multiline />
      <Button label="Enviar pedido de orçamento" onPress={enviar} loading={enviando} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 14, lineHeight: 18 },
  group: { fontSize: 13, fontWeight: '800', color: colors.teal, marginBottom: 8, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 10 },
});
