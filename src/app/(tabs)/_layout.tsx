import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return <Ionicons name={name} size={24} color={focused ? colors.primary : colors.textMuted} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerTintColor: colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="calculadora/index"
        options={{
          title: 'Calculadora',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calculator' : 'calculator-outline'} focused={focused} />,
          headerTitle: 'Calculadora de materiais',
        }}
      />
      <Tabs.Screen
        name="servicos/index"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'briefcase' : 'briefcase-outline'} focused={focused} />,
          headerTitle: 'Serviços',
        }}
      />
      <Tabs.Screen
        name="orcamentos/index"
        options={{
          title: 'Orçamentos',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'document-text' : 'document-text-outline'} focused={focused} />,
          headerTitle: 'Orçamentos',
        }}
      />
      <Tabs.Screen
        name="conta/index"
        options={{
          title: 'Conta',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          headerTitle: 'Minha conta',
        }}
      />
    </Tabs>
  );
}
