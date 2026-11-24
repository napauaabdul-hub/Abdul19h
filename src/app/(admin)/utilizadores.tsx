import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, updateUser } from '../../lib/storage';
import { User } from '../../lib/types';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, shadow } from '../../lib/theme';

export default function AdminUtilizadores() {
  const [users, setUsers] = useState<User[]>([]);

  useFocusEffect(
    useCallback(() => {
      getUsers().then(setUsers);
    }, []),
  );

  function alternar(u: User) {
    const acao = u.suspenso ? 'reativar' : 'suspender';
    Alert.alert(`${acao.charAt(0).toUpperCase() + acao.slice(1)} conta`, `${acao} a conta de ${u.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: u.suspenso ? 'Reativar' : 'Suspender',
        style: u.suspenso ? 'default' : 'destructive',
        onPress: async () => {
          await updateUser(u.id, { suspenso: !u.suspenso });
          setUsers(await getUsers());
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState icon="people-outline" title="Sem utilizadores" message="As contas registadas aparecem aqui." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>
                {item.nome} {item.suspenso ? <Text style={styles.suspenso}>· suspenso</Text> : null}
              </Text>
              <Text style={styles.dado}>{item.telefone}</Text>
              <Text style={styles.dado}>{item.email}</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => alternar(item)}>
              <Ionicons name={item.suspenso ? 'play-circle-outline' : 'ban-outline'} size={24} color={item.suspenso ? colors.success : colors.danger} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 10,
    ...shadow.card,
  },
  avatar: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 18 },
  nome: { fontSize: 14, fontWeight: '800', color: colors.text },
  suspenso: { color: colors.danger, fontSize: 12 },
  dado: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
