import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Reemplazá esta IP por la de tu PC en la red local
const API_URL = 'http://192.168.1.39:8000';

type Partido = {
  partido_id: number;
  liga: string;
  fecha: string;
  local: string;
  visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: string;
};

export default function HomeScreen() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarPartidos = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/partidos`);
      const data = await respuesta.json();
      setPartidos(data.partidos);
    } catch (error) {
      console.error('Error cargando partidos:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarPartidos();
  }, [cargarPartidos]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarPartidos();
  };

  const formatearHora = (fechaUtc: string) => {
    const fecha = new Date(fechaUtc);
    fecha.setHours(fecha.getHours() - 3); // UTC-3 Argentina
    return fecha.toISOString().substring(11, 16);
  };

  const renderEstado = (partido: Partido) => {
    if (partido.estado === 'FINISHED') return 'Final';
    if (partido.estado === 'IN_PLAY') return '🔴 VIVO';
    if (partido.estado === 'PAUSED') return '⏸️ ET';
    return formatearHora(partido.fecha);
  };

  const renderMarcador = (partido: Partido) => {
    if (partido.goles_local !== null && partido.goles_visitante !== null) {
      return `${partido.local}  ${partido.goles_local} - ${partido.goles_visitante}  ${partido.visitante}`;
    }
    return `${partido.local} vs ${partido.visitante}`;
  };

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
        🏠 Partidos de hoy
      </ThemedText>
      <FlatList
        data={partidos}
        keyExtractor={(item) => item.partido_id.toString()}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <ThemedText style={styles.vacio}>No hay partidos programados para hoy.</ThemedText>
        }
        renderItem={({ item }) => (
          <ThemedView style={styles.fila}>
            <ThemedView style={styles.columnaEstado}>
              <ThemedText style={styles.textoChico}>{renderEstado(item)}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.columnaPartido}>
              <ThemedText style={styles.textoLiga}>{item.liga}</ThemedText>
              <ThemedText>{renderMarcador(item)}</ThemedText>
            </ThemedView>
          </ThemedView>
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
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    marginBottom: 16,
  },
  fila: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#666',
  },
  columnaEstado: {
    width: 70,
    justifyContent: 'center',
  },
  columnaPartido: {
    flex: 1,
  },
  textoChico: {
    fontSize: 12,
    opacity: 0.7,
  },
  textoLiga: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 2,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
});