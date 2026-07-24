import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const BACKEND_URL = 'https://civicai-kenya-backend-772950697200.us-central1.run.app';

interface Document {
  id: number;
  title: string;
  description: string;
  document_type: string;
  category: string;
  ministry: string;
  file_url: string;
  file_size: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_CATEGORIES = [
  { id: 'all', name: 'All', icon: 'documents' },
  { id: 'constitution', name: 'Constitution', icon: 'book' },
  { id: 'laws', name: 'Laws & Acts', icon: 'scale' },
  { id: 'policies', name: 'Policies', icon: 'document-text' },
  { id: 'reports', name: 'Reports', icon: 'stats-chart' },
  { id: 'forms', name: 'Forms', icon: 'clipboard' },
  { id: 'guidelines', name: 'Guidelines', icon: 'bulb' },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setPage(1);
    setDocuments([]);
    fetchDocuments(1, true);
  }, [selectedCategory]);

  const fetchDocuments = async (pageNum: number, isNew: boolean = false) => {
    try {
      if (isNew) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const categoryParam = selectedCategory !== 'all' ? `&category=${selectedCategory}` : '';
      const response = await fetch(
        `${BACKEND_URL}/api/documents?page=${pageNum}&per_page=20${categoryParam}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      
      if (isNew) {
        setDocuments(data.documents || []);
      } else {
        setDocuments(prev => [...prev, ...(data.documents || [])]);
      }
      
      setHasMore(data.has_more || false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchDocuments(page + 1);
    }
  };

  const handleDocumentPress = async (document: Document) => {
    try {
      // Record download/view
      await fetch(`${BACKEND_URL}/api/documents/${document.id}`);
      
      // Open document URL
      if (document.file_url) {
        Linking.openURL(document.file_url);
      }
    } catch (error) {
      console.error('Error accessing document:', error);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return { icon: 'document-text', color: '#F44336' };
      case 'doc':
      case 'docx':
        return { icon: 'document-text', color: '#2196F3' };
      case 'xls':
      case 'xlsx':
        return { icon: 'grid', color: '#4CAF50' };
      case 'ppt':
      case 'pptx':
        return { icon: 'easel', color: '#FF9800' };
      default:
        return { icon: 'document', color: '#666' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Government Documents</Text>
            <Text style={styles.headerSubtitle}>
              Official documents, laws, and publications
            </Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {DOCUMENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? '#FFFFFF' : '#666'}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents List */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptySubtext}>
              No documents available in this category yet.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                loadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            <View style={styles.documentsList}>
              {documents.map((document) => {
                const docIcon = getDocumentIcon(document.document_type);
                
                return (
                  <TouchableOpacity
                    key={document.id}
                    style={styles.documentCard}
                    onPress={() => handleDocumentPress(document)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.documentIconContainer, { backgroundColor: docIcon.color + '15' }]}>
                      <Ionicons name={docIcon.icon as any} size={28} color={docIcon.color} />
                    </View>
                    
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle} numberOfLines={2}>
                        {document.title}
                      </Text>
                      
                      {document.description && (
                        <Text style={styles.documentDescription} numberOfLines={2}>
                          {document.description}
                        </Text>
                      )}
                      
                      <View style={styles.documentMeta}>
                        {document.ministry && (
                          <View style={styles.metaItem}>
                            <Ionicons name="business-outline" size={12} color="#999" />
                            <Text style={styles.metaText} numberOfLines={1}>
                              {document.ministry}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar-outline" size={12} color="#999" />
                          <Text style={styles.metaText}>
                            {formatDate(document.created_at)}
                          </Text>
                        </View>
                        
                        {document.file_size && (
                          <View style={styles.metaItem}>
                            <Ionicons name="document-outline" size={12} color="#999" />
                            <Text style={styles.metaText}>
                              {formatFileSize(document.file_size)}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.documentFooter}>
                        <View style={styles.downloadBadge}>
                          <Ionicons name="download-outline" size={12} color="#4CAF50" />
                          <Text style={styles.downloadText}>
                            {document.download_count || 0} downloads
                          </Text>
                        </View>
                        
                        <View style={styles.documentType}>
                          <Text style={styles.documentTypeText}>
                            {document.document_type?.toUpperCase() || 'DOC'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {loadingMore && (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            )}
            
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginBottom: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  headerTitleContainer: {
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categoriesWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  documentsList: {
    padding: 16,
    gap: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  documentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    lineHeight: 20,
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#999',
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  documentType: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  documentTypeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    color: '#666',
  },
  bottomSpacer: {
    height: 40,
  },
});