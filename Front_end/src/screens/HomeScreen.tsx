import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, Modal, TextInput, StatusBar, ScrollView } from 'react-native';
import api from '../services/api';
import { RiskEvent } from '../types';
import { RiskCard } from '../components/RiskCard';

const TIPOS_RISCO = [
  { id: 'ALAGAMENTO', label: 'Alagamento', emoji: '🌊' },
  { id: 'ILHA_DE_CALOR', label: 'Calor', emoji: '☀️' },
  { id: 'FALTA_ENERGIA', label: 'Energia', emoji: '⚡' },
  { id: 'DESLIZAMENTO', label: 'Deslizamento', emoji: '⛰️' },
  { id: 'INCENDIO', label: 'Incêndio', emoji: '🔥' },
  { id: 'POLUICAO', label: 'Poluição', emoji: '🌫️' },
  { id: 'VENDAVAL', label: 'Vendaval', emoji: '🌪️' }
];

const ORIGENS = [
  { id: 'COMUNIDADE', label: 'Comunidade', emoji: '👥' },
  { id: 'SENSOR', label: 'Sensor IoT', emoji: '📡' },
  { id: 'BASE_PUBLICA', label: 'Base Pública', emoji: '🏛️' },
  { id: 'DEFESA_CIVIL', label: 'Defesa Civil', emoji: '🚨' }
];

export function HomeScreen() {
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState('');
  const [type, setType] = useState('ALAGAMENTO');
  const [source, setSource] = useState('COMUNIDADE');
  const [confidenceInput, setConfidenceInput] = useState('80');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events/alerts');
      setEvents(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Servidor inacessível. O Spring Boot está a rodar?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!location.trim()) {
      alert('Introduza a localização do evento.');
      return;
    }

    let parsedConfidence = parseFloat(confidenceInput);
    if (isNaN(parsedConfidence) || parsedConfidence < 0 || parsedConfidence > 100) {
      alert('A confiança deve ser um número entre 0 e 100.');
      return;
    }

    setSending(true);
    
    // Converte para decimal antes de enviar para o Java
    const confLevelDecimal = parsedConfidence / 100;

    const newEvent = { 
      type, 
      location, 
      source, 
      confidenceLevel: confLevelDecimal
    };

    try {
      await api.post('/events', newEvent);
      setLocation('');
      setConfidenceInput('80');
      setModalVisible(false);
      fetchAlerts(); // Busca a lista atualizada com a Prioridade já calculada pelo Java
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar o alerta.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir o alerta.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>UrbiSafe</Text>
          <Text style={styles.headerSubtitle}>Monitoramento de Riscos Urbanos</Text>
        </View>
        <Text style={styles.headerBadge}>🛡️</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Sincronizando dados...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={fetchAlerts}>
            <Text style={styles.reloadButtonText}>↻ Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {events.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyEmoji}>🏙️✨</Text>
              <Text style={styles.emptyText}>Nenhum alerta registrado.</Text>
            </View>
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <RiskCard item={item} onDelete={handleDeleteAlert} />}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.9}>
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHeader}>
                <Text style={styles.modalTitle}>Novo Registro</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.label}>📍 Localização</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: Sorocaba - São Paulo" 
                  placeholderTextColor="#94A3B8"
                  value={location} 
                  onChangeText={setLocation} 
                />
              </View>

              <Text style={styles.label}>📊 Nível de Confiança (%)</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Ex: 80" 
                  keyboardType="numeric"
                  placeholderTextColor="#94A3B8"
                  value={confidenceInput} 
                  onChangeText={setConfidenceInput} 
                  maxLength={3}
                />
              </View>

              <Text style={styles.label}>⚠️ Tipo de Risco</Text>
              <View style={styles.chipsContainer}>
                {TIPOS_RISCO.map((risk) => (
                  <TouchableOpacity 
                    key={risk.id}
                    style={[styles.chip, type === risk.id && styles.chipActive]}
                    onPress={() => setType(risk.id)}
                  >
                    <Text style={styles.chipEmoji}>{risk.emoji}</Text>
                    <Text style={[styles.chipText, type === risk.id && styles.chipTextActive]}>{risk.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>📡 Origem do Dado</Text>
              <View style={styles.chipsContainer}>
                {ORIGENS.map((origem) => (
                  <TouchableOpacity 
                    key={origem.id}
                    style={[styles.chip, source === origem.id && styles.chipActive]}
                    onPress={() => setSource(origem.id)}
                  >
                    <Text style={styles.chipEmoji}>{origem.emoji}</Text>
                    <Text style={[styles.chipText, source === origem.id && styles.chipTextActive]}>{origem.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.submitButton, sending && styles.submitButtonDisabled]} onPress={handleCreateAlert} disabled={sending}>
                {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitButtonText}>Registrar e Calcular Prioridade</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#1E293B', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 8, marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, color: '#94A3B8', marginTop: 4, fontWeight: '500' },
  headerBadge: { fontSize: 32 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748B', fontWeight: '500' },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorText: { color: '#64748B', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, color: '#475569', fontWeight: 'bold' },
  reloadButton: { marginTop: 24, backgroundColor: '#3B82F6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, elevation: 2 },
  reloadButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 32, right: 24, backgroundColor: '#3B82F6', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabIcon: { color: '#FFF', fontSize: 36, fontWeight: '300', marginTop: -4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, elevation: 10, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  closeButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F1F5F9', borderRadius: 20 },
  closeButtonText: { fontSize: 18, color: '#64748B', fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16 },
  input: { paddingVertical: 14, fontSize: 16, color: '#0F172A' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F1F5F9', borderRadius: 24, borderWidth: 1, borderColor: 'transparent', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  chipEmoji: { fontSize: 16, marginRight: 8 },
  chipText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: '#3B82F6', fontWeight: '800' },
  submitButton: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 24, elevation: 4 },
  submitButtonDisabled: { backgroundColor: '#94A3B8', elevation: 0 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});