import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = 'http://192.168.1.40:8000';

type Liga = {
  id: number;
  nombre: string;
  codigo: string;
  pais: string;
};

export default function LigasScreen() {
  const [ligas, setLigas] = useState<Liga[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/ligas`)
      .then((res) => res.json())
      .then((data) => setLigas(data))
      .catch((error) => console.error('Error cargando ligas:', error));
  }, []);

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="title" style={styles.titulo}>
        🏆 Ligas
      </ThemedText>
      <FlatList
        data={ligas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fila}
            onPress={() => router.push({ pathname: '/liga', params: { ligaId: item.id, nombre: item.nombre } })}
          >
            <ThemedText style={styles.nombreLiga}>{item.nombre}</ThemedText>
            <ThemedText style={styles.pais}>{item.pais}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  titulo: {
    marginBottom: 16,
  },
  fila: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#666',
  },
  nombreLiga: {
    fontSize: 16,
    fontWeight: '600',
  },
  pais: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});