import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

export function SetTitle({ title }: { title: string }) {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: title });
  }, [navigation, title]);
  return null;
}
