import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_URL = 'http://192.168.1.40:8000';

type Stats = {
  total_partidos: number;
  goles_favor_promedio: number;
  goles_contra_promedio: number;
  partidos_anoto: number;
  partidos_no_recibio: number;
  partidos_mas_de_25: number;
};

type Prediccion = {
  local: string;
  visitante: string;
  resultado: {
    prob_local: number;
    prob_empate: number;
    prob_visitante: number;
  };
  marcador_mas_probable: string;
  over_under: Record<string, { under: number; over: number }>;
  btts: { si: number; no: number };
  stats_local: Stats;
  stats_visitante: Stats;
};
export default function DetalleScreen() {
  const { partidoId } = useLocalSearchParams<{ partidoId: string }>();
  const [prediccion, setPrediccion] = useState<Prediccion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/partidos/${partidoId}/prediccion`)
      .then((res) => res.json())
      .then((data) => {
        setPrediccion(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error cargando predicción:', error);
        setCargando(false);
      });
  }, [partidoId]);

  if (cargando) {
    return (
      <ThemedView style={styles.centrado}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!prediccion) {
    return (
      <ThemedView style={styles.centrado}>
        <ThemedText>No se pudo cargar la predicción.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.contenedor}>
      <ThemedText type="title" style={styles.titulo}>
        {prediccion.local} vs {prediccion.visitante}
      </ThemedText>

      <ThemedText type="subtitle" style={styles.seccion}>
        Resultado del partido
      </ThemedText>
      <ThemedView style={styles.filaProbabilidades}>
        <ThemedView style={styles.tarjeta}>
          <ThemedText style={styles.etiqueta}>Gana {prediccion.local}</ThemedText>
          <ThemedText style={styles.valorGrande}>
            {(prediccion.resultado.prob_local * 100).toFixed(1)}%
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.tarjeta}>
          <ThemedText style={styles.etiqueta}>Empate</ThemedText>
          <ThemedText style={styles.valorGrande}>
            {(prediccion.resultado.prob_empate * 100).toFixed(1)}%
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.tarjeta}>
          <ThemedText style={styles.etiqueta}>Gana {prediccion.visitante}</ThemedText>
          <ThemedText style={styles.valorGrande}>
            {(prediccion.resultado.prob_visitante * 100).toFixed(1)}%
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedText style={styles.marcador}>
        Marcador más probable: {prediccion.marcador_mas_probable}
      </ThemedText>

      <ThemedText type="subtitle" style={styles.seccion}>
        Goles totales - Más/Menos
      </ThemedText>
      {Object.entries(prediccion.over_under).map(([linea, valores]) => (
        <ThemedView key={linea} style={styles.filaGoles}>
          <ThemedText>Más de {linea}: {(valores.over * 100).toFixed(1)}%</ThemedText>
          <ThemedText>Menos de {linea}: {(valores.under * 100).toFixed(1)}%</ThemedText>
        </ThemedView>
      ))}

      <ThemedText type="subtitle" style={styles.seccion}>
        Ambos anotan
      </ThemedText>
      <ThemedView style={styles.filaGoles}>
        <ThemedText>Sí: {(prediccion.btts.si * 100).toFixed(1)}%</ThemedText>
        <ThemedText>No: {(prediccion.btts.no * 100).toFixed(1)}%</ThemedText>
      </ThemedView>

      <ThemedText type="subtitle" style={styles.seccion}>
        ¿Por qué estas probabilidades?
      </ThemedText>

      <ThemedText style={styles.nombreEquipoStats}>
        {prediccion.local} (últimos {prediccion.stats_local.total_partidos} partidos)
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • Anotó en {prediccion.stats_local.partidos_anoto} de {prediccion.stats_local.total_partidos} partidos
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • No recibió goles en {prediccion.stats_local.partidos_no_recibio} de {prediccion.stats_local.total_partidos} partidos
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • Promedio: {prediccion.stats_local.goles_favor_promedio} a favor, {prediccion.stats_local.goles_contra_promedio} en contra
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • {prediccion.stats_local.partidos_mas_de_25} de {prediccion.stats_local.total_partidos} partidos con más de 2.5 goles
      </ThemedText>

      <ThemedText style={[styles.nombreEquipoStats, { marginTop: 14 }]}>
        {prediccion.visitante} (últimos {prediccion.stats_visitante.total_partidos} partidos)
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • Anotó en {prediccion.stats_visitante.partidos_anoto} de {prediccion.stats_visitante.total_partidos} partidos
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • No recibió goles en {prediccion.stats_visitante.partidos_no_recibio} de {prediccion.stats_visitante.total_partidos} partidos
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • Promedio: {prediccion.stats_visitante.goles_favor_promedio} a favor, {prediccion.stats_visitante.goles_contra_promedio} en contra
      </ThemedText>
      <ThemedText style={styles.lineaStat}>
        • {prediccion.stats_visitante.partidos_mas_de_25} de {prediccion.stats_visitante.total_partidos} partidos con más de 2.5 goles
      </ThemedText>

      <ThemedText style={styles.leyenda}>
        Estas estadísticas son la base del modelo de Poisson que calcula las probabilidades de arriba.
      </ThemedText>
    </ScrollView>
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
  seccion: {
    marginTop: 20,
    marginBottom: 10,
  },
  filaProbabilidades: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  tarjeta: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  etiqueta: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 4,
  },
  valorGrande: {
    fontSize: 20,
    fontWeight: '700',
  },
  marcador: {
    marginTop: 12,
    fontWeight: '600',
  },
  filaGoles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#666',
  },
  nombreEquipoStats: {
    fontWeight: '700',
    marginBottom: 4,
  },
  lineaStat: {
    fontSize: 13,
    marginBottom: 2,
  },
  leyenda: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 16,
    marginBottom: 30,
  },
});