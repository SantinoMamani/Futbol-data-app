import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View } from 'react-native';
import { traducirEquipo } from '@/utils/traducciones';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { API_URL } from '@/utils/config';

const VERDE = '#22C55E';
const GRIS = '#3A3A3A';
const ROJO = '#EF4444';
const AMARILLO = '#D4FF3F';

type Mercado = {
  mercado: string;
  hits: boolean[];
  total: number;
  aciertos: number;
  porcentaje: number;
};

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
  historial_local: Mercado[];
  historial_visitante: Mercado[];
};

function BarraSegmentada({ hits }: { hits: boolean[] }) {
  return (
    <View style={styles.filaBarra}>
      {hits.map((hit, i) => (
        <View
          key={i}
          style={[styles.segmento, { backgroundColor: hit ? VERDE : ROJO }]}
        />
      ))}
    </View>
  );
}

function TarjetaMercado({
  equipo,
  mercado,
}: {
  equipo: string;
  mercado: Mercado;
}) {
  return (
    <ThemedView style={styles.tarjeta}>
      <View style={styles.filaTop}>
        <ThemedText style={styles.nombreEquipo}>{equipo}</ThemedText>
        <ThemedText style={styles.porcentajeGrande}>{mercado.porcentaje}%</ThemedText>
      </View>
      <ThemedText style={styles.nombreMercado}>{mercado.mercado}</ThemedText>
      <View style={styles.filaBarraContenedor}>
        <ThemedText style={styles.etiquetaL}>L{mercado.total}</ThemedText>
        <BarraSegmentada hits={mercado.hits} />
      </View>
      <ThemedText style={styles.leyendaMercado}>
        {mercado.aciertos}/{mercado.total} en los últimos {mercado.total} partidos
      </ThemedText>
    </ThemedView>
  );
}

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
        <ActivityIndicator size="large" color={AMARILLO} />
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

  // Combinar mercados de ambos equipos, ordenados por porcentaje, para la sección destacada
  const mercadosCombinados = [
    ...prediccion.historial_local.map((m) => ({ ...m, equipo: traducirEquipo(prediccion.local) })),
    ...prediccion.historial_visitante.map((m) => ({ ...m, equipo: traducirEquipo(prediccion.visitante) })),
  ].sort((a, b) => b.porcentaje - a.porcentaje);

  const destacado = mercadosCombinados[0];
  const resto = mercadosCombinados.slice(1, 5);

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.header}>
        <ThemedText style={styles.logo}>⚡ Match Insights</ThemedText>
      </View>

      <ThemedText style={styles.tituloPartido}>
        {traducirEquipo(prediccion.local)} vs {traducirEquipo(prediccion.visitante)}
      </ThemedText>

      {/* Mercado destacado, estilo Scout Picks */}
      {destacado && (
        <TarjetaMercado equipo={destacado.equipo} mercado={destacado} />
      )}

      {/* Resultado del partido */}
      <ThemedView style={styles.tarjeta}>
        <ThemedText style={styles.nombreMercado}>Resultado del partido</ThemedText>
        <ThemedText style={styles.marcadorProbable}>
          Marcador más probable: {prediccion.marcador_mas_probable}
        </ThemedText>
        {[
          { label: traducirEquipo(prediccion.local), valor: prediccion.resultado.prob_local },
          { label: 'Empate', valor: prediccion.resultado.prob_empate },
          { label: traducirEquipo(prediccion.visitante), valor: prediccion.resultado.prob_visitante },
        ].map((item) => (
          <View key={item.label} style={styles.filaResultado}>
            <ThemedText style={styles.labelResultado}>{item.label}</ThemedText>
            <View style={styles.barraFondo}>
              <View
                style={[
                  styles.barraRelleno,
                  { width: `${Math.max(item.valor * 100, 3)}%` },
                ]}
              />
            </View>
            <ThemedText style={styles.porcentajeChico}>
              {(item.valor * 100).toFixed(1)}%
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      {/* Otros mercados destacados (combinados) */}
      {resto.map((m, i) => (
        <TarjetaMercado key={i} equipo={m.equipo} mercado={m} />
      ))}

      {/* Goles totales */}
      <ThemedView style={styles.tarjeta}>
        <ThemedText style={styles.nombreMercado}>Goles totales - Más/Menos</ThemedText>
        {Object.entries(prediccion.over_under).map(([linea, valores]) => (
          <View key={linea} style={styles.filaGoles}>
            <ThemedText style={styles.textoGoles}>
              +{linea}: <ThemedText style={styles.textoGolesValor}>{(valores.over * 100).toFixed(0)}%</ThemedText>
            </ThemedText>
            <ThemedText style={styles.textoGoles}>
              -{linea}: <ThemedText style={styles.textoGolesValor}>{(valores.under * 100).toFixed(0)}%</ThemedText>
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      {/* BTTS */}
      <ThemedView style={[styles.tarjeta, styles.ultimaTarjeta]}>
        <ThemedText style={styles.nombreMercado}>Ambos equipos anotan</ThemedText>
        <View style={styles.filaGoles}>
          <ThemedText style={styles.textoGoles}>
            Sí: <ThemedText style={styles.textoGolesValor}>{(prediccion.btts.si * 100).toFixed(0)}%</ThemedText>
          </ThemedText>
          <ThemedText style={styles.textoGoles}>
            No: <ThemedText style={styles.textoGolesValor}>{(prediccion.btts.no * 100).toFixed(0)}%</ThemedText>
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedText style={styles.leyendaFinal}>
        Probabilidades calculadas con distribución de Poisson sobre el historial real de goles de cada equipo.
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 50,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    fontSize: 16,
    fontWeight: '800',
    color: AMARILLO,
  },
  tituloPartido: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
  },
  tarjeta: {
    backgroundColor: '#161616',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  ultimaTarjeta: {
    marginBottom: 24,
  },
  filaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nombreEquipo: {
    fontSize: 15,
    fontWeight: '700',
  },
  porcentajeGrande: {
    fontSize: 18,
    fontWeight: '800',
    color: VERDE,
  },
  nombreMercado: {
    fontSize: 13,
    opacity: 0.75,
    marginBottom: 10,
  },
  filaBarraContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  etiquetaL: {
    fontSize: 11,
    opacity: 0.6,
    width: 28,
  },
  filaBarra: {
    flexDirection: 'row',
    flex: 1,
    gap: 3,
  },
  segmento: {
    flex: 1,
    height: 8,
    borderRadius: 3,
  },
  leyendaMercado: {
    fontSize: 11,
    color: VERDE,
    opacity: 0.9,
  },
  marcadorProbable: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.85,
  },
  filaResultado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  labelResultado: {
    fontSize: 12,
    width: 90,
  },
  barraFondo: {
    flex: 1,
    height: 8,
    backgroundColor: GRIS,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    backgroundColor: AMARILLO,
    borderRadius: 4,
  },
  porcentajeChico: {
    fontSize: 12,
    fontWeight: '700',
    width: 42,
    textAlign: 'right',
  },
  filaGoles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  textoGoles: {
    fontSize: 12,
    opacity: 0.8,
  },
  textoGolesValor: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 1,
  },
  leyendaFinal: {
    fontSize: 10,
    opacity: 0.5,
    marginBottom: 30,
    textAlign: 'center',
  },
});