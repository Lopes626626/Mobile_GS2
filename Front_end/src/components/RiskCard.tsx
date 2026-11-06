import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RiskEvent } from '../types';

interface RiskCardProps {
  item: RiskEvent;
  onDelete: (id: number) => void;
}

export function RiskCard({ item, onDelete }: RiskCardProps) {
  const isHighRisk = item.priorityScore >= 50;

  // Formata a data ISO 8601 vinda do Spring Boot para o formato local (DD/MM/AAAA HH:MM)
  const formatarData = (dataOriginal?: string) => {
    if (!dataOriginal) return 'Data não registada';
    const data = new Date(dataOriginal);
    return data.toLocaleString('pt-BR');
  };

  return (
    <View style={[styles.card, isHighRisk ? styles.highRisk : styles.lowRisk]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.type}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteText}>X</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>{formatarData(item.timestamp)}</Text>
      
      <View style={styles.divider} />
      
      <Text style={styles.details}>📍 Local: {item.location}</Text>
      <Text style={styles.details}>📡 Fonte: {item.source} (Confiança: {(item.confidenceLevel * 100).toFixed(0)}%)</Text>
      <Text style={styles.score}>Prioridade: {item.priorityScore}/100</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 8, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  highRisk: { backgroundColor: '#ffebee', borderLeftWidth: 6, borderLeftColor: '#f44336' },
  lowRisk: { backgroundColor: '#fff', borderLeftWidth: 6, borderLeftColor: '#ff9800' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  deleteButton: { backgroundColor: '#ff5252', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  deleteText: { color: 'white', fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 8 },
  details: { fontSize: 14, color: '#555', marginTop: 4 },
  score: { fontSize: 15, fontWeight: 'bold', marginTop: 8, color: '#d32f2f' }
});