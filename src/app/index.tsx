import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/auth';
import { colors } from '../lib/theme';

export default function Index() {
  const { state } = useAuth();
  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  if (state.status === 'none') return <Redirect href="/(auth)/welcome" />;
  return <Redirect href="/(tabs)" />;
}
