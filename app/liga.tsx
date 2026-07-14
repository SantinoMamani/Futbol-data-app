import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = 'http://192.168.1.40:8000';

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

type Partido = {
  partido_id: number;
  liga_id: number;
  fecha: string;
  equipo_local_id: number;
  equipo_visitante_id: number;
  local: string;
  visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: string;
};

export default function LigaScreen() {
  const { ligaId, nombre } = useLocalSearchParams<{ ligaId: string; nombre: string }>();
  const [pestana, setPestana] = useState<'tabla' | 'calendario'>('tabla');

  const [tabla, setTabla] = useState<EquipoTabla[]>([]);
  const [cargandoTabla, setCargandoTabla] = useState(true);

  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [cargandoCalendario, setCargandoCalendario] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/ligas/${ligaId}/tabla`)
      .then((res) => res.json())
      .then((data) => {
        setTabla(data.tabla);
        setCargandoTabla(false);
      })
      .catch((error) => {
        console.error('Error cargando tabla:', error);
        setCargandoTabla(false);
      });

    fetch(`${API_URL}/ligas/${ligaId}/calendario`)
      .then((res) => res.json())
      .then((data) => {
        setPartidos(data.partidos);
        setCargandoCalendario(false);
      })
      .catch((error) => {
        console.error('Error cargando calendario:', error);
        setCargandoCalendario(false);
      });
  }, [ligaId]);

  const formatearFecha = (fechaUtc: string) => {
    const fecha = new Date(fechaUtc);
    fecha.setHours(fecha.getHours() - 3);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
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

  // Agrupar partidos por día
  const partidosPorDia: Record<string, Partido[]> = {};
  partidos.forEach((p) => {
    const dia = formatearFecha(p.fecha);
    if (!partidosPorDia[dia]) partidosPorDia[dia] = [];
    partidosPorDia[dia].push(p);
  });

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="title" style={styles.titulo}>
        🏆 {nombre}
      </ThemedText>

      <ThemedView style={styles.filaPestanas}>
        <TouchableOpacity onPress={() => setPestana('tabla')} style={styles.botonPestana}>
          <ThemedText style={pestana === 'tabla' ? styles.pestanaActiva : styles.pestanaInactiva}>
            Tabla de posiciones
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPestana('calendario')} style={styles.botonPestana}>
          <ThemedText style={pestana === 'calendario' ? styles.pestanaActiva : styles.pestanaInactiva}>
            Calendario
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {pestana === 'tabla' && (
        cargandoTabla ? (
          <ThemedView style={styles.centrado}>
            <ActivityIndicator size="large" />
          </ThemedView>
        ) : (
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
                  <ThemedView style={styles.filaTabla}>
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
        )
      )}

      {pestana === 'calendario' && (
        cargandoCalendario ? (
          <ThemedView style={styles.centrado}>
            <ActivityIndicator size="large" />
          </ThemedView>
        ) : (
          <FlatList
            data={Object.keys(partidosPorDia)}
            keyExtractor={(dia) => dia}
            ListEmptyComponent={
              <ThemedText style={styles.vacio}>No hay partidos cargados para esta competición.</ThemedText>
            }
            renderItem={({ item: dia }) => (
              <ThemedView>
                <ThemedText style={styles.fechaSeparador}>{dia}</ThemedText>
                {partidosPorDia[dia].map((partido) => (
                  <TouchableOpacity
                    key={partido.partido_id}
                    style={styles.filaPartido}
                    onPress={() =>
                      router.push({ pathname: '/detalle', params: { partidoId: partido.partido_id } })
                    }
                  >
                    <ThemedView style={styles.columnaEstado}>
                      <ThemedText style={styles.textoChico}>{renderEstado(partido)}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.columnaPartido}>
                      <ThemedText>{renderMarcador(partido)}</ThemedText>
                    </ThemedView>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            )}
          />
        )
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
  titulo: {
    marginBottom: 12,
  },
  filaPestanas: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 20,
  },
  botonPestana: {
    paddingBottom: 6,
  },
  pestanaActiva: {
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#4A90D9',
    paddingBottom: 4,
  },
  pestanaInactiva: {
    opacity: 0.5,
  },
  filaHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    paddingBottom: 6,
  },
  filaTabla: {
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
  fechaSeparador: {
    fontWeight: '700',
    fontSize: 13,
    marginTop: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  filaPartido: {
    flexDirection: 'row',
    paddingVertical: 8,
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
  vacio: {
    textAlign: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
});