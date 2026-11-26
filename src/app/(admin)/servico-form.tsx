import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getServices } from '../../lib/catalog';
import { newId, saveServices } from '../../lib/storage';
import { Service } from '../../lib/types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

const ICONES = ['home', 'layers', 'cube', 'pencil-ruler', 'calculator', 'hammer', 'construct', 'briefcase'];

export default function ServicoForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [form, setForm] = useState({
    titulo: '',
    categoria: '',
    descricao: '',
    icon: 'construct',
    destaques: '',
    precoReferencia: '',
    whatsapp: '+258840000000',
    rating: '4.8',
    avaliacoes: '50',
  });
  const [carregado, setCarregado] = useState(!id);

  useEffect(() => {
    if (!id) return;
    getServices().then((all) => {
      const s = all.find((x) => x.id === id);
      if (s) {
        setForm({
          titulo: s.titulo,
          categoria: s.categoria,
          descricao: s.descricao,
          icon: s.icon,
          destaques: s.destaques.join(', '),
          precoReferencia: s.precoReferencia,
          whatsapp: s.whatsapp,
          rating: String(s.rating),
          avaliacoes: String(s.avaliacoes),
        });
      }
      setCarregado(true);
    });
  }, [id]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function guardar() {
    if (!form.titulo.trim() || !form.categoria.trim()) {
      Alert.alert('Dados em falta', 'Indique o título e a categoria.');
      return;
    }
    const all = await getServices();
    const servico: Service = {
      id: id ?? newId(),
      titulo: form.titulo.trim(),
      categoria: form.categoria.trim(),
      descricao: form.descricao.trim(),
      icon: form.icon.trim() || 'construct',
      destaques: form.destaques.split(',').map((d) => d.trim()).filter(Boolean),
      precoReferencia: form.precoReferencia.trim(),
      whatsapp: form.whatsapp.trim(),
      rating: parseNumber(form.rating) || 4.8,
      avaliacoes: Math.round(parseNumber(form.avaliacoes)) || 0,
    };
    const next = id ? all.map((s) => (s.id === id ? servico : s)) : [...all, servico];
    await saveServices(next);
    router.back();
  }

  if (!carregado) return null;

  return (
    <Screen>
      <Text style={styles.titulo}>{id ? 'Editar serviço' : 'Novo serviço'}</Text>
      <Input label="Título" value={form.titulo} onChangeText={set('titulo')} placeholder="Ex.: Construção de casas" />
      <Input label="Categoria" value={form.categoria} onChangeText={set('categoria')} placeholder="Ex.: Construção" />
      <Input label="Descrição" value={form.descricao} onChangeText={set('descricao')} placeholder="Descrição do serviço" multiline />
      <Text style={styles.group}>Ícone (nome Ionicons)</Text>
      <View style={styles.icones}>
        {ICONES.map((ic) => (
          <Ionicons
            key={ic}
            name={ic as never}
            size={22}
            color={form.icon === ic ? colors.white : colors.primary}
            style={[styles.iconeChip, form.icon === ic && { backgroundColor: colors.primary }]}
            onPress={() => setForm((f) => ({ ...f, icon: ic }))}
          />
        ))}
      </View>
      <Input label="Destaques (separados por vírgula)" value={form.destaques} onChangeText={set('destaques')} placeholder="T1 a T4, Moradias" />
      <Input label="Preço de referência" value={form.precoReferencia} onChangeText={set('precoReferencia')} placeholder="Ex.: a partir de MT 220,00" />
      <Input label="WhatsApp" value={form.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Avaliação (0–5)" value={form.rating} onChangeText={set('rating')} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="N.º avaliações" value={form.avaliacoes} onChangeText={set('avaliacoes')} keyboardType="number-pad" />
        </View>
      </View>
      <Button label="Guardar serviço" onPress={guardar} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 12 },
  group: { fontSize: 13, fontWeight: '800', color: colors.teal, marginBottom: 8 },
  icones: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  iconeChip: { padding: 10, borderRadius: 12, backgroundColor: colors.tint },
  row: { flexDirection: 'row', gap: 10 },
});
