import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

const TABS: [string, string, string][] = [
  ["pdv", "🛒", "PDV"],
  ["caixa", "💰", "Caixa"],
  ["credito", "👥", "Crédito"],
  ["relatorios", "📊", "Relatórios"],
  ["estoque", "📦", "Estoque"],
  ["cadastros", "⚙️", "Cadastros"],
];

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#15803d", tabBarLabelStyle: { fontSize: 10 } }}>
      {TABS.map(([name, icon, label]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ size }) => <Text style={{ fontSize: size }}>{icon}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}
