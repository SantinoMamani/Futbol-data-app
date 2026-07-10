import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatearFechaISO(fecha: Date) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function HomeScreen() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarPartidos = useCallback(async (fecha: Date) => {
    try {
      const fechaStr = formatearFechaISO(fecha);
      const respuesta = await fetch(`${API_URL}/partidos?fecha=${fechaStr}`);
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
    setCargando(true);
    cargarPartidos(fechaSeleccionada);
  }, [fechaSeleccionada, cargarPartidos]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarPartidos(fechaSeleccionada);
  };

  const cambiarDia = (delta: number) => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta);
    setFechaSeleccionada(nuevaFecha);
  };

  const formatearHora = (fechaUtc: string) => {
    const fecha = new Date(fechaUtc);
    fecha.setHours(fecha.getHours() - 3);
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

  const nombreDia = `${DIAS[fechaSeleccionada.getDay()]} ${fechaSeleccionada.getDate()} de ${MESES[fechaSeleccionada.getMonth()]}`;

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedView style={styles.filaFecha}>
        <TouchableOpacity onPress={() => cambiarDia(-1)} style={styles.botonFlecha}>
          <ThemedText style={styles.flecha}>⬅️</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.textoFecha}>{nombreDia}</ThemedText>
        <TouchableOpacity onPress={() => cambiarDia(1)} style={styles.botonFlecha}>
          <ThemedText style={styles.flecha}>➡️</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedText type="title" style={styles.titulo}>
        🏠 Partidos
      </ThemedText>

      {cargando ? (
        <ThemedView style={styles.centrado}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : (
        <FlatList
          data={partidos}
          keyExtractor={(item) => item.partido_id.toString()}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <ThemedText style={styles.vacio}>No hay partidos programados para este día.</ThemedText>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fila}
              onPress={() => router.push({ pathname: '/detalle', params: { partidoId: item.partido_id } })}
            >
              <ThemedView style={styles.columnaEstado}>
                <ThemedText style={styles.textoChico}>{renderEstado(item)}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.columnaPartido}>
                <ThemedText style={styles.textoLiga}>{item.liga}</ThemedText>
                <ThemedText>{renderMarcador(item)}</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          )}
        />
      )}
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
  filaFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  botonFlecha: {
    padding: 8,
  },
  flecha: {
    fontSize: 18,
  },
  textoFecha: {
    fontSize: 16,
    fontWeight: '600',
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