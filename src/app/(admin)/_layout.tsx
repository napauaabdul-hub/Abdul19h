import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { getAdminSession } from '../../lib/storage';
import { colors } from '../../lib/theme';

export default function AdminLayout() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    getAdminSession().then((s) => setAutenticado(!!s));
  }, []);

  if (autenticado === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.gray },
      }}
    >
      {autenticado ? (
        <>
          <Stack.Screen name="index" options={{ title: 'Painel administrativo' }} />
          <Stack.Screen name="servicos" options={{ title: 'Serviços' }} />
          <Stack.Screen name="servico-form" options={{ title: 'Serviço' }} />
          <Stack.Screen name="precos" options={{ title: 'Materiais e preços (MT)' }} />
          <Stack.Screen name="parametros" options={{ title: 'Parâmetros da calculadora' }} />
          <Stack.Screen name="plantas" options={{ title: 'Plantas' }} />
          <Stack.Screen name="planta-form" options={{ title: 'Planta' }} />
          <Stack.Screen name="pedidos" options={{ title: 'Pedidos' }} />
          <Stack.Screen name="utilizadores" options={{ title: 'Utilizadores' }} />
        </>
      ) : null}
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}
