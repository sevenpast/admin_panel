import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';
import { SectionTabs } from '../../components/SectionTabs';

type AssessmentType = 'surf' | 'wellness' | 'safety' | 'team';

type AssessmentQuestion = {
  id: string;
  question: string;
  category: string;
  type: 'rating' | 'text' | 'multiple_choice';
  options?: string[];
};

type AssessmentResult = {
  questionId: string;
  answer: string | number;
  timestamp: string;
};

const ASSESSMENT_QUESTIONS: Record<AssessmentType, AssessmentQuestion[]> = {
  surf: [
    {
      id: 'surf_experience',
      question: 'Wie viele Jahre surfst du bereits aktiv?',
      category: 'Experience',
      type: 'multiple_choice',
      options: ['0-1 Jahre', '1-3 Jahre', '3-5 Jahre', '5+ Jahre'],
    },
    {
      id: 'surf_comfort',
      question: 'Wie wohl fühlst du dich bei Wellen über 1.5m?',
      category: 'Comfort',
      type: 'rating',
    },
    {
      id: 'surf_technique',
      question: 'Kannst du einen kontrollierten Bottom Turn fahren?',
      category: 'Technique',
      type: 'multiple_choice',
      options: ['Ja, sicher', 'Manchmal', 'Nein, noch nicht'],
    },
    {
      id: 'surf_goals',
      question: 'Was ist dein Hauptfokus für diese Woche?',
      category: 'Goals',
      type: 'text',
    },
  ],
  wellness: [
    {
      id: 'wellness_energy',
      question: 'Wie würdest du dein aktuelles Energielevel beschreiben?',
      category: 'Energy',
      type: 'rating',
    },
    {
      id: 'wellness_sleep',
      question: 'Wie war deine Schlafqualität in den letzten Tagen?',
      category: 'Sleep',
      type: 'rating',
    },
    {
      id: 'wellness_stress',
      question: 'Fühlst du dich gestresst oder entspannt?',
      category: 'Stress',
      type: 'multiple_choice',
      options: ['Sehr entspannt', 'Entspannt', 'Neutral', 'Gestresst', 'Sehr gestresst'],
    },
  ],
  safety: [
    {
      id: 'safety_rules',
      question: 'Kennst du die gängigen Right-of-Way-Regeln?',
      category: 'Knowledge',
      type: 'multiple_choice',
      options: ['Ja, vollständig', 'Teilweise', 'Nein'],
    },
    {
      id: 'safety_conditions',
      question: 'Wie beurteilst du die aktuellen Wetterbedingungen?',
      category: 'Conditions',
      type: 'rating',
    },
    {
      id: 'safety_equipment',
      question: 'Ist deine Ausrüstung vollständig und funktionsfähig?',
      category: 'Equipment',
      type: 'multiple_choice',
      options: ['Ja, alles OK', 'Kleinere Probleme', 'Größere Probleme'],
    },
  ],
  team: [
    {
      id: 'team_communication',
      question: 'Wie gut funktioniert die Kommunikation im Team?',
      category: 'Communication',
      type: 'rating',
    },
    {
      id: 'team_support',
      question: 'Fühlst du dich vom Team unterstützt?',
      category: 'Support',
      type: 'rating',
    },
    {
      id: 'team_feedback',
      question: 'Hast du Feedback oder Verbesserungsvorschläge?',
      category: 'Feedback',
      type: 'text',
    },
  ],
};

const ASSESSMENT_TABS = [
  { key: 'surf' as AssessmentType, label: 'Surf Assessment', icon: 'surfboard' },
  { key: 'wellness' as AssessmentType, label: 'Wellness Check', icon: 'heart-pulse' },
  { key: 'safety' as AssessmentType, label: 'Safety Review', icon: 'shield-check' },
  { key: 'team' as AssessmentType, label: 'Team Feedback', icon: 'account-group' },
];

export default function AssessmentScreen() {
  const [activeTab, setActiveTab] = useState<AssessmentType>('surf');
  const [responses, setResponses] = useState<Record<string, AssessmentResult>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestions = ASSESSMENT_QUESTIONS[activeTab];

  const handleResponse = (questionId: string, answer: string | number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        timestamp: new Date().toISOString(),
      },
    }));
  };

  const getResponseValue = (questionId: string) => {
    return responses[questionId]?.answer || '';
  };

  const getCompletionRate = () => {
    const totalQuestions = currentQuestions.length;
    const answeredQuestions = currentQuestions.filter(q => responses[q.id]).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const currentValue = getResponseValue(question.id);

    return (
      <View key={question.id} style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionCategory}>{question.category}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {question.type === 'rating' && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  currentValue === rating && styles.ratingButtonActive,
                ]}
                onPress={() => handleResponse(question.id, rating)}
              >
                <Text style={[
                  styles.ratingText,
                  currentValue === rating && styles.ratingTextActive,
                ]}>
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'multiple_choice' && question.options && (
          <View style={styles.optionsContainer}>
            {question.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  currentValue === option && styles.optionButtonActive,
                ]}
                onPress={() => handleResponse(question.id, option)}
              >
                <Text style={[
                  styles.optionText,
                  currentValue === option && styles.optionTextActive,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'text' && (
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputPlaceholder}>
              {currentValue ? `Antwort: ${currentValue}` : 'Tippe hier deine Antwort ein...'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Assessment</Text>
            <Text style={styles.subtitle}>Bewertungen und Feedback sammeln</Text>
          </View>
          <SectionTabs items={ASSESSMENT_TABS} activeKey={activeTab} onChange={setActiveTab} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getCompletionRate()}%` }]} />
          </View>
          <Text style={styles.progressText}>{getCompletionRate()}% abgeschlossen</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {currentQuestions.map(renderQuestion)}
        </ScrollView>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => setShowResults(!showResults)}
          >
            <MaterialCommunityIcons name="chart-line" size={20} color="#2563EB" />
            <Text style={styles.secondaryButtonText}>
              {showResults ? 'Verstecken' : 'Ergebnisse'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => {
              // In a real app, this would save to the backend
              console.log('Assessment responses:', responses);
            }}
          >
            <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Speichern</Text>
          </TouchableOpacity>
        </View>

        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  page: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 18,
  },
  headerText: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5F5',
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 120,
    gap: 16,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  questionHeader: {
    marginBottom: responsive.spacing.md,
  },
  questionCategory: {
    fontSize: responsive.fontSize.small,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  questionText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsive.spacing.xs,
  },
  ratingButton: {
    flex: 1,
    height: responsive.button.large,
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  ratingText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#64748B',
  },
  ratingTextActive: {
    color: '#FFFFFF',
  },
  optionsContainer: {
    gap: responsive.spacing.xs,
  },
  optionButton: {
    paddingVertical: responsive.spacing.md,
    paddingHorizontal: responsive.spacing.md,
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
  },
  optionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  textInputContainer: {
    paddingVertical: responsive.spacing.md,
    paddingHorizontal: responsive.spacing.md,
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    minHeight: 48,
    justifyContent: 'center',
  },
  textInputPlaceholder: {
    fontSize: responsive.fontSize.medium,
    color: '#9CA3AF',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: responsive.padding.large,
    paddingVertical: responsive.spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: responsive.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.medium,
    gap: responsive.spacing.xs,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryButtonText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#2563EB',
  },
});
