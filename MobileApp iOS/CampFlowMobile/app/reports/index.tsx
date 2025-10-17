import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';

type ReportType = 'analytics' | 'performance' | 'export';
type ReportViewMode = 'overview' | 'detail';

type ReportData = {
  id: string;
  title: string;
  type: ReportType;
  description: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'error';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
};

type AnalyticsData = {
  totalGuests: number;
  totalRevenue: number;
  averageStay: number;
  occupancyRate: number;
  guestSatisfaction: number;
  topActivities: Array<{ name: string; count: number }>;
  monthlyTrends: Array<{ month: string; guests: number; revenue: number }>;
};

type PerformanceData = {
  responseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
  databaseQueries: number;
  cacheHitRate: number;
  systemLoad: number;
};

const REPORT_TYPES: Array<{ value: ReportType; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = [
  { value: 'analytics', label: 'Analytics', icon: 'chart-line', color: '#3B82F6' },
  { value: 'performance', label: 'Performance', icon: 'speedometer', color: '#10B981' },
  { value: 'export', label: 'Export Data', icon: 'download', color: '#F59E0B' },
];

const INITIAL_REPORTS: ReportData[] = [
  {
    id: 'report-1',
    title: 'Guest Analytics',
    type: 'analytics',
    description: 'Comprehensive guest statistics and trends',
    lastGenerated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
    icon: 'chart-line',
    color: '#3B82F6',
  },
  {
    id: 'report-2',
    title: 'System Performance',
    type: 'performance',
    description: 'Application performance metrics and monitoring',
    lastGenerated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'ready',
    icon: 'speedometer',
    color: '#10B981',
  },
  {
    id: 'report-3',
    title: 'Data Export',
    type: 'export',
    description: 'Export all camp data for backup or analysis',
    lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
    icon: 'download',
    color: '#F59E0B',
  },
];

const SAMPLE_ANALYTICS: AnalyticsData = {
  totalGuests: 1247,
  totalRevenue: 89450,
  averageStay: 5.2,
  occupancyRate: 78.5,
  guestSatisfaction: 4.6,
  topActivities: [
    { name: 'Surf Lessons', count: 456 },
    { name: 'Beach Activities', count: 234 },
    { name: 'Yoga Sessions', count: 189 },
    { name: 'BBQ Events', count: 156 },
    { name: 'Hiking Tours', count: 98 },
  ],
  monthlyTrends: [
    { month: 'Jan', guests: 89, revenue: 6420 },
    { month: 'Feb', guests: 112, revenue: 8040 },
    { month: 'Mar', guests: 134, revenue: 9640 },
    { month: 'Apr', guests: 156, revenue: 11240 },
    { month: 'May', guests: 178, revenue: 12840 },
    { month: 'Jun', guests: 201, revenue: 14440 },
  ],
};

const SAMPLE_PERFORMANCE: PerformanceData = {
  responseTime: 245,
  uptime: 99.8,
  errorRate: 0.2,
  activeUsers: 23,
  databaseQueries: 1247,
  cacheHitRate: 87.3,
  systemLoad: 34.2,
};

export default function ReportsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  const [mode, setMode] = useState<ReportViewMode>('overview');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedType, setSelectedType] = useState<ReportType>('analytics');
  const [reports, setReports] = useState<ReportData[]>(INITIAL_REPORTS);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (mode === 'detail' && selectedReport) {
      setSelectedType(selectedReport.type);
    }

    if (mode === 'overview') {
      setSelectedReport(null);
    }
  }, [mode, selectedReport]);

  const filteredReports = reports.filter(report => report.type === selectedType);

  const renderReportCard = ({ item }: { item: ReportData }) => {
    const timeAgo = new Date(item.lastGenerated);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timeAgo.getTime()) / (1000 * 60 * 60));
    
    let timeText = '';
    if (diffInHours < 1) {
      timeText = 'Just now';
    } else if (diffInHours < 24) {
      timeText = `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      timeText = `${diffInDays}d ago`;
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.reportCard}
        activeOpacity={0.82}
        onPress={() => {
          setSelectedReport(item);
          setMode('detail');
        }}
      >
        <View style={styles.reportCardHeader}>
          <View style={[styles.reportIcon, { backgroundColor: `${item.color}20` }]}>
            <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>{item.title}</Text>
            <Text style={styles.reportDescription}>{item.description}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={styles.reportFooter}>
          <Text style={styles.reportTime}>Last generated: {timeText}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#10B981';
      case 'generating': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;

    setIsGenerating(true);
    setReports(prev => prev.map(report => 
      report.id === selectedReport.id 
        ? { ...report, status: 'generating' as const }
        : report
    ));

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === selectedReport.id 
          ? { 
              ...report, 
              status: 'ready' as const,
              lastGenerated: new Date().toISOString()
            }
          : report
      ));
      setIsGenerating(false);
      Alert.alert('Report Generated', `${selectedReport.title} has been generated successfully.`);
    }, 3000);
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'CSV', onPress: () => Alert.alert('Export Started', 'CSV export has been initiated.') },
        { text: 'JSON', onPress: () => Alert.alert('Export Started', 'JSON export has been initiated.') },
        { text: 'PDF', onPress: () => Alert.alert('Export Started', 'PDF export has been initiated.') },
      ]
    );
  };

  const AnalyticsDetail = () => (
    <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>Guest Analytics</Text>
        <Text style={styles.detailSubtitle}>Comprehensive guest statistics and trends</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_ANALYTICS.totalGuests.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Total Guests</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>${SAMPLE_ANALYTICS.totalRevenue.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Total Revenue</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_ANALYTICS.averageStay} days</Text>
          <Text style={styles.metricLabel}>Average Stay</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_ANALYTICS.occupancyRate}%</Text>
          <Text style={styles.metricLabel}>Occupancy Rate</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Guest Satisfaction</Text>
        <View style={styles.satisfactionContainer}>
          <Text style={styles.satisfactionScore}>{SAMPLE_ANALYTICS.guestSatisfaction}/5.0</Text>
          <View style={styles.satisfactionStars}>
            {Array.from({ length: 5 }, (_, i) => (
              <MaterialCommunityIcons
                key={i}
                name={i < Math.floor(SAMPLE_ANALYTICS.guestSatisfaction) ? 'star' : 'star-outline'}
                size={20}
                color="#F59E0B"
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Top Activities</Text>
        {SAMPLE_ANALYTICS.topActivities.map((activity, index) => (
          <View key={index} style={styles.activityRow}>
            <Text style={styles.activityName}>{activity.name}</Text>
            <Text style={styles.activityCount}>{activity.count} participants</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Monthly Trends</Text>
        {SAMPLE_ANALYTICS.monthlyTrends.map((trend, index) => (
          <View key={index} style={styles.trendRow}>
            <Text style={styles.trendMonth}>{trend.month}</Text>
            <Text style={styles.trendGuests}>{trend.guests} guests</Text>
            <Text style={styles.trendRevenue}>${trend.revenue.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const PerformanceDetail = () => (
    <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>System Performance</Text>
        <Text style={styles.detailSubtitle}>Application performance metrics and monitoring</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_PERFORMANCE.responseTime}ms</Text>
          <Text style={styles.metricLabel}>Response Time</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_PERFORMANCE.uptime}%</Text>
          <Text style={styles.metricLabel}>Uptime</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_PERFORMANCE.errorRate}%</Text>
          <Text style={styles.metricLabel}>Error Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{SAMPLE_PERFORMANCE.activeUsers}</Text>
          <Text style={styles.metricLabel}>Active Users</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Database Performance</Text>
        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>Queries per hour</Text>
          <Text style={styles.performanceValue}>{SAMPLE_PERFORMANCE.databaseQueries.toLocaleString()}</Text>
        </View>
        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>Cache hit rate</Text>
          <Text style={styles.performanceValue}>{SAMPLE_PERFORMANCE.cacheHitRate}%</Text>
        </View>
        <View style={styles.performanceRow}>
          <Text style={styles.performanceLabel}>System load</Text>
          <Text style={styles.performanceValue}>{SAMPLE_PERFORMANCE.systemLoad}%</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Performance Status</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusText}>All systems operational</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.statusText}>High load detected</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statusText}>Database optimized</Text>
        </View>
      </View>
    </ScrollView>
  );

  const ExportDetail = () => (
    <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>Data Export</Text>
        <Text style={styles.detailSubtitle}>Export all camp data for backup or analysis</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Export Options</Text>
        <TouchableOpacity style={styles.exportOption} onPress={handleExportData}>
          <MaterialCommunityIcons name="file-excel" size={24} color="#10B981" />
          <View style={styles.exportInfo}>
            <Text style={styles.exportTitle}>CSV Export</Text>
            <Text style={styles.exportDescription}>Export data in CSV format for Excel</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportOption} onPress={handleExportData}>
          <MaterialCommunityIcons name="code-json" size={24} color="#3B82F6" />
          <View style={styles.exportInfo}>
            <Text style={styles.exportTitle}>JSON Export</Text>
            <Text style={styles.exportDescription}>Export data in JSON format for developers</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportOption} onPress={handleExportData}>
          <MaterialCommunityIcons name="file-pdf-box" size={24} color="#EF4444" />
          <View style={styles.exportInfo}>
            <Text style={styles.exportTitle}>PDF Report</Text>
            <Text style={styles.exportDescription}>Generate comprehensive PDF report</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Export History</Text>
        <View style={styles.historyItem}>
          <Text style={styles.historyDate}>Today, 14:30</Text>
          <Text style={styles.historyType}>CSV Export - Guest Data</Text>
          <Text style={styles.historySize}>2.4 MB</Text>
        </View>
        <View style={styles.historyItem}>
          <Text style={styles.historyDate}>Yesterday, 09:15</Text>
          <Text style={styles.historyType}>PDF Report - Monthly Summary</Text>
          <Text style={styles.historySize}>1.8 MB</Text>
        </View>
        <View style={styles.historyItem}>
          <Text style={styles.historyDate}>3 days ago, 16:45</Text>
          <Text style={styles.historyType}>JSON Export - Full Backup</Text>
          <Text style={styles.historySize}>15.2 MB</Text>
        </View>
      </View>
    </ScrollView>
  );

  const Overview = () => (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.typeScroll}
        contentContainerStyle={styles.typeContainer}
      >
        {REPORT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeChip,
              selectedType === type.value && styles.typeChipActive
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <MaterialCommunityIcons 
              name={type.icon} 
              size={20} 
              color={selectedType === type.value ? '#FFFFFF' : type.color} 
            />
            <Text style={[
              styles.typeChipText,
              selectedType === type.value && styles.typeChipTextActive
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderReportCard}
        contentContainerStyle={styles.reportsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chart-line-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No reports found</Text>
            <Text style={styles.emptyStateText}>
              No reports available for the selected type.
            </Text>
          </View>
        }
      />
    </View>
  );

  const Detail = () => {
    const actionButtons: Array<{
      key: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      color: string;
      onPress: () => void;
    }> = [
      {
        key: 'back',
        icon: 'view-dashboard-outline',
        color: '#2563EB',
        onPress: () => setMode('overview'),
      },
      {
        key: 'generate',
        icon: 'refresh',
        color: isGenerating ? '#6B7280' : '#10B981',
        onPress: handleGenerateReport,
      },
      {
        key: 'share',
        icon: 'share-variant',
        color: '#8B5CF6',
        onPress: () => Alert.alert('Share Report', 'Share functionality would be implemented here.'),
      },
    ];

    return (
      <View style={styles.detailWrapper}>
        <View style={styles.actionBar}>
          {actionButtons.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionButton}
              onPress={action.onPress}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
            </TouchableOpacity>
          ))}
        </View>

        {selectedType === 'analytics' && <AnalyticsDetail />}
        {selectedType === 'performance' && <PerformanceDetail />}
        {selectedType === 'export' && <ExportDetail />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Analytics & Performance</Text>
        </View>

        <View style={styles.contentArea}>
          {mode === 'overview' && <Overview />}
          {mode === 'detail' && <Detail />}
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
  contentArea: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    backgroundColor: '#F5F6FB',
  },
  typeScroll: {
    marginBottom: 20,
  },
  typeContainer: {
    paddingHorizontal: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 8,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  reportsList: {
    paddingBottom: 120,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  detailWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
    backgroundColor: '#F5F6FB',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  satisfactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  satisfactionScore: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  satisfactionStars: {
    flexDirection: 'row',
    gap: 4,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityName: {
    fontSize: 14,
    color: '#111827',
  },
  activityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  trendMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 40,
  },
  trendGuests: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  trendRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    width: 80,
    textAlign: 'right',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#111827',
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  exportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    width: 80,
  },
  historyType: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    marginLeft: 16,
  },
  historySize: {
    fontSize: 12,
    color: '#6B7280',
    width: 60,
    textAlign: 'right',
  },
});
