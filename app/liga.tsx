import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = 'http://192.168.1.39:8000';

type EquipoTabla = {
  equipo: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
};

export default function LigaScreen() {
  const { ligaId, nombre } = useLocalSearchParams<{ ligaId: string; nombre: string }>();
  const [tabla, setTabla] = useState<EquipoTabla[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/ligas/${ligaId}/tabla`)
      .then((res) => res.json())
      .then((data) => {
        setTabla(data.tabla);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error cargando tabla:', error);
        setCargando(false);
      });
  }, [ligaId]);

  if (cargando) {
    return (
      <ThemedView style={styles.centrado}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="title" style={styles.titulo}>
        🏆 {nombre}
      </ThemedText>

      <ScrollView horizontal>
        <ThemedView>
          <ThemedView style={styles.filaHeader}>
            <ThemedText style={[styles.celda, styles.celdaEquipo, styles.headerTexto]}>Equipo</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>PJ</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>G</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>E</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>P</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>GF</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>GC</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>DIF</ThemedText>
            <ThemedText style={[styles.celda, styles.headerTexto]}>PTS</ThemedText>
          </ThemedView>
          <FlatList
            data={tabla}
            keyExtractor={(item, index) => `${item.equipo}-${index}`}
            renderItem={({ item, index }) => (
              <ThemedView style={styles.fila}>
                <ThemedText style={[styles.celda, styles.celdaEquipo]}>{index + 1}. {item.equipo}</ThemedText>
                <ThemedText style={styles.celda}>{item.pj}</ThemedText>
                <ThemedText style={styles.celda}>{item.g}</ThemedText>
                <ThemedText style={styles.celda}>{item.e}</ThemedText>
                <ThemedText style={styles.celda}>{item.p}</ThemedText>
                <ThemedText style={styles.celda}>{item.gf}</ThemedText>
                <ThemedText style={styles.celda}>{item.gc}</ThemedText>
                <ThemedText style={styles.celda}>{item.dif}</ThemedText>
                <ThemedText style={[styles.celda, styles.puntos]}>{item.pts}</ThemedText>
              </ThemedView>
            )}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    marginBottom: 16,
  },
  filaHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    paddingBottom: 6,
  },
  fila: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#666',
  },
  celda: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
  },
  celdaEquipo: {
    width: 160,
    textAlign: 'left',
    fontSize: 13,
  },
  headerTexto: {
    fontWeight: '700',
    fontSize: 11,
    opacity: 0.7,
  },
  puntos: {
    fontWeight: '700',
  },
});