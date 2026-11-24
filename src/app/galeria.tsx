import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OBRAS_CONCLUIDAS } from '../lib/data/obras';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SetTitle } from '../components/SetTitle';
import { colors } from '../lib/theme';

export default function Galeria() {
  return (
    <Screen scroll={false} pad={false}>
      <SetTitle title="Obras concluídas" />
      <FlatList
        data={OBRAS_CONCLUIDAS}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={[styles.thumb, { backgroundColor: item.cor }]}>
              <Ionicons name={item.icon as never} size={34} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.meta}>
                {item.tipo} · {item.area} m² · {item.local} · {item.ano}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>{item.descricao}</Text>
              <Pressable
                style={styles.pedir}
                onPress={() => router.push({ pathname: '/servicos/solicitar', params: { servico: 'construcao-casas' } })}
              >
                <Text style={styles.pedirText}>Pedir obra semelhante</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.orange} />
              </Pressable>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  thumb: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 15, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  desc: { fontSize: 12, color: colors.text, marginTop: 5, lineHeight: 16 },
  pedir: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, alignSelf: 'flex-start' },
  pedirText: { fontSize: 12, fontWeight: '800', color: colors.orange },
});
