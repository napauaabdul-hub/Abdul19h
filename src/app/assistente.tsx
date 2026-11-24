import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalc } from '../context/calc';
import { responder, sugestoes } from '../lib/assistant';
import { SetTitle } from '../components/SetTitle';
import { colors, radius } from '../lib/theme';

interface Msg {
  id: string;
  autor: 'user' | 'bot';
  texto: string;
}

export default function Assistente() {
  const insets = useSafeAreaInsets();
  const { draft, resultado } = useCalc();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: '0',
      autor: 'bot',
      texto:
        'Olá! Sou o assistente de obra da NAPAUA BUILD. Explico materiais e etapas, ajudo a preencher a calculadora e aponto dados em falta. Os cálculos vêm de fórmulas verificáveis — não invento quantidades nem substituo um profissional habilitado.',
    },
  ]);
  const [texto, setTexto] = useState('');
  const [aEscrever, setAEscrever] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const n = useRef(1);

  function enviar(pergunta: string) {
    const p = pergunta.trim();
    if (!p) return;
    setMsgs((m) => [...m, { id: String(n.current++), autor: 'user', texto: p }]);
    setTexto('');
    setAEscrever(true);
    setTimeout(() => {
      const resposta = responder(p, { draft, resultado });
      setMsgs((m) => [...m, { id: String(n.current++), autor: 'bot', texto: resposta }]);
      setAEscrever(false);
    }, 350);
  }

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [msgs, aEscrever]);

  return (
    <View style={styles.root}>
      <SetTitle title="Assistente de obra" />
      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.balao, item.autor === 'user' ? styles.user : styles.bot]}>
            {item.autor === 'bot' ? (
              <Ionicons name="construct" size={15} color={colors.primary} style={{ marginBottom: 4 }} />
            ) : null}
            <Text style={[styles.texto, item.autor === 'user' ? styles.textoUser : null]}>{item.texto}</Text>
          </View>
        )}
        ListFooterComponent={
          aEscrever ? (
            <View style={[styles.balao, styles.bot]}>
              <Text style={styles.texto}>A escrever…</Text>
            </View>
          ) : undefined
        }
      />
      <View style={styles.sugestoes}>
        {sugestoes().map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => enviar(s)}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Pergunte sobre a sua obra…"
            placeholderTextColor={colors.textMuted}
            multiline
            onSubmitEditing={() => enviar(texto)}
          />
          <Pressable style={[styles.enviar, !texto.trim() && { opacity: 0.4 }]} onPress={() => enviar(texto)}>
            <Ionicons name="send" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  balao: { maxWidth: '86%', borderRadius: radius.lg, padding: 12, marginBottom: 10 },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  texto: { fontSize: 14, color: colors.text, lineHeight: 20 },
  textoUser: { color: colors.white },
  sugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  chip: {
    backgroundColor: colors.tint,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 34,
    justifyContent: 'center',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    minHeight: 42,
    maxHeight: 110,
    fontSize: 14,
    color: colors.text,
  },
  enviar: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
