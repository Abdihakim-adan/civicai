import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
  Alert,
  Animated,
  Keyboard,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width, height } = Dimensions.get('window');
const API_URL = 'https://civicai-kenya-backend-772950697200.us-central1.run.app/api/ask';
const DOCUMENT_API_URL = 'https://civicai-kenya-backend-772950697200.us-central1.run.app/api/ask/document';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  agent?: string;
  isDocument?: boolean;
  fileName?: string;
  timestamp?: Date;
}

const SUGGESTION_CHIPS = [
  { icon: '📋', label: 'My ID is lost what should I do?' },
  { icon: '👤', label: 'Who is the MP for Embakasi East?' },
  { icon: '⚖️', label: 'What are my rights under Article 43?' },
  { icon: '📄', label: 'Upload document to explain' },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('CivicAI is thinking...');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleAsk = async (presetQuestion?: string) => {
    const queryToSubmit = presetQuestion || question;
    if (!queryToSubmit.trim() || loading) return;

    Keyboard.dismiss();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryToSubmit.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!presetQuestion) setQuestion('');
    setLoadingLabel('CivicAI is thinking...');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryToSubmit.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      const answerText = data.response || data.answer || 'No response returned.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answerText,
        agent: data.agent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ ${err.message || 'Failed to connect to CivicAI backend.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndAnalyzeDocument = async () => {
    if (loading) return;

    let result;
    try {
      result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
    } catch (err) {
      console.error('DocumentPicker error:', err);
      Alert.alert('Error', 'Could not open file picker.');
      return;
    }

    if (result.canceled || !result.assets?.[0]) {
      console.log('Document picker cancelled or no asset selected.');
      return;
    }

    const file = result.assets[0];

    console.log('Picked file:', JSON.stringify(file, null, 2));

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `📄 ${file.name}`,
      isDocument: true,
      fileName: file.name,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoadingLabel('Reading and analyzing your document...');
    setLoading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const fileResponse = await fetch(file.uri);
        const blob = await fileResponse.blob();
        formData.append('file', blob, file.name ?? 'document');
      } else {
        formData.append('file', {
          uri: file.uri,
          name: file.name ?? 'document',
          type: file.mimeType || 'application/octet-stream',
        } as any);
      }

      const response = await fetch(DOCUMENT_API_URL, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      const data = await response.json();

      console.log('Upload response body:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.response || 'No explanation returned.',
        agent: data.agent || 'Document Agent',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Document upload error:', err);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ ${err.message || 'Failed to analyze document.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      Alert.alert('Upload Failed', err.message || 'Failed to analyze document.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipPress = (chip: string) => {
    if (chip === 'Upload document to explain') {
      handlePickAndAnalyzeDocument();
    } else {
      handleAsk(chip);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => {/* Navigate back */}} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={28} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerAvatar}>
              <Ionicons name="school" size={20} color="#4CAF50" />
            </View>
            <View>
              <ThemedText style={styles.headerTitle}>CivicAI Chat</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {loading ? 'Typing...' : 'Online'}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClearChat} style={styles.headerAction}>
              <Ionicons name="trash-outline" size={22} color="#999" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="ellipsis-vertical" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            messages.length === 0 && styles.centeredContent,
            { paddingBottom: keyboardHeight > 0 ? 16 : 20 },
          ]}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.length === 0 ? (
            <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.welcomeIconContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.welcomeIconGradient}
                >
                  <Ionicons name="chatbubbles" size={48} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <ThemedText style={styles.welcomeTitle}>
                Ask CivicAI
              </ThemedText>
              <ThemedText style={styles.welcomeSubtitle}>
                Ask anything about the Constitution, government services, or your rights.
              </ThemedText>

              <View style={styles.chipsContainer}>
                {SUGGESTION_CHIPS.map((chip, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chip,
                      index === SUGGESTION_CHIPS.length - 1 && styles.uploadChip,
                    ]}
                    onPress={() => handleChipPress(chip.label)}
                  >
                    <ThemedText style={styles.chipIcon}>{chip.icon}</ThemedText>
                    <ThemedText style={styles.chipText}>{chip.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          ) : (
            <>
              {messages.map((item, index) => {
                const isUser = item.sender === 'user';
                const showTimestamp = index === 0 || 
                  (index > 0 && messages[index - 1].sender !== item.sender);

                return (
                  <View key={item.id}>
                    {showTimestamp && item.timestamp && (
                      <View style={styles.timestampContainer}>
                        <ThemedText style={styles.timestampText}>
                          {item.timestamp.toLocaleDateString([], { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </ThemedText>
                      </View>
                    )}
                    <View
                      style={[
                        styles.messageWrapper,
                        isUser ? styles.userWrapper : styles.assistantWrapper,
                      ]}
                    >
                      {!isUser && (
                        <View style={styles.avatarCircle}>
                          <Ionicons name="sparkles" size={16} color="#4CAF50" />
                        </View>
                      )}
                      <View
                        style={[
                          styles.messageBubble,
                          isUser ? styles.userBubble : styles.assistantBubble,
                        ]}
                      >
                        {!isUser && item.agent && (
                          <View style={styles.agentTagContainer}>
                            <ThemedText style={styles.agentTag}>🤖 {item.agent}</ThemedText>
                          </View>
                        )}
                        <ThemedText
                          style={[
                            styles.messageText,
                            isUser ? styles.userText : styles.assistantText,
                          ]}
                        >
                          {item.text}
                        </ThemedText>
                        {item.timestamp && (
                          <ThemedText style={styles.messageTime}>
                            {formatTime(item.timestamp)}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

              {loading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingAvatar}>
                    <Ionicons name="sparkles" size={16} color="#4CAF50" />
                  </View>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <ThemedText style={styles.loadingText}>{loadingLabel}</ThemedText>
                  </View>
                </View>
              )}
              
              {/* Bottom spacer for keyboard */}
              <View style={{ height: 16 }} />
            </>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom + 8, 8) }]}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handlePickAndAnalyzeDocument}
              disabled={loading}
            >
              <Ionicons name="attach-outline" size={22} color="#666" />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Ask CivicAI anything..."
              placeholderTextColor="#999"
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={500}
              onFocus={() => {
                setIsTyping(true);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
              onBlur={() => setIsTyping(false)}
            />

            {question.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setQuestion('')}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!question.trim() || loading) && styles.disabledSendButton,
              ]}
              onPress={() => handleAsk()}
              disabled={!question.trim() || loading}
            >
              <Ionicons 
                name="send" 
                size={18} 
                color={!question.trim() || loading ? '#999' : '#FFFFFF'} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Character count */}
          <View style={styles.inputFooter}>
            <ThemedText style={styles.charCount}>
              {question.length}/500
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBack: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAction: {
    padding: 8,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  welcomeIconContainer: {
    marginBottom: 24,
  },
  welcomeIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: width - 60,
  },
  chipsContainer: {
    width: '100%',
    gap: 10,
    maxWidth: width - 40,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadChip: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
    flex: 1,
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timestampText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
    gap: 8,
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#1a1a2e',
  },
  agentTagContainer: {
    marginBottom: 6,
  },
  agentTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 4,
  },
  loadingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F7FA',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: '#1a1a2e',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledSendButton: {
    backgroundColor: '#E8E8E8',
    shadowOpacity: 0,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
  },
});