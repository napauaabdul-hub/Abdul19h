import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RoomSpec } from '../lib/types';
import { colors } from '../lib/theme';

const PALETTE = ['#E4F2EA', '#DFF0F4', '#FDEBDD', '#EDEBF7', '#FDF3D8', '#E8F6EE'];

export function FloorPlan({
  rooms,
  comprimento,
  largura,
  height = 180,
}: {
  rooms: RoomSpec[];
  comprimento: number;
  largura: number;
  height?: number;
}) {
  const aspect = comprimento / Math.max(largura, 0.01);
  return (
    <View
      style={[
        styles.canvas,
        { height, aspectRatio: aspect > 0 ? aspect : 1.5 },
      ]}
    >
      {rooms.map((room, i) => (
        <View
          key={room.nome + i}
          style={{
            position: 'absolute',
            left: `${room.x * 100}%`,
            top: `${room.y * 100}%`,
            width: `${room.w * 100}%`,
            height: `${room.h * 100}%`,
            backgroundColor: PALETTE[i % PALETTE.length],
            borderColor: colors.primary,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
          }}
        >
          <Text style={styles.room} numberOfLines={2}>
            {room.nome}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray,
  },
  room: { fontSize: 10, fontWeight: '700', color: colors.teal, textAlign: 'center' },
});
