import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Types
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface QuizTopic {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string[];
  description: string;
}

interface QuizHistory {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
  timeTaken: number;
  correctAnswers: number;
}

const QUIZ_TOPICS: QuizTopic[] = [
  {
    id: 'constitution',
    name: 'Constitution of Kenya',
    icon: '📜',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#2E7D32'],
    description: 'Test your knowledge of the Kenya Constitution 2010',
  },
  {
    id: 'bill-of-rights',
    name: 'Bill of Rights',
    icon: '⚖️',
    color: '#2196F3',
    gradient: ['#2196F3', '#1565C0'],
    description: 'Fundamental rights and freedoms of every Kenyan',
  },
  {
    id: 'devolution',
    name: 'Devolution & Counties',
    icon: '🏛️',
    color: '#FF9800',
    gradient: ['#FF9800', '#E65100'],
    description: 'County governments, devolution, and local governance',
  },
  {
    id: 'government-services',
    name: 'Government Services',
    icon: '🛂',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#6A1B9A'],
    description: 'Services like IDs, passports, KRA PIN, and more',
  },
  {
    id: 'leadership',
    name: 'Leadership & Integrity',
    icon: '👔',
    color: '#F44336',
    gradient: ['#F44336', '#C62828'],
    description: 'Principles of leadership and integrity in Kenya',
  },
  {
    id: 'national-values',
    name: 'National Values',
    icon: '🇰🇪',
    color: '#009688',
    gradient: ['#009688', '#004D40'],
    description: 'National values and principles of governance',
  },
];

// Quiz Data
const QUIZ_DATA: Record<string, QuizQuestion[]> = {
  constitution: [
    {
      id: 1,
      question: 'Which article of the Constitution establishes the sovereignty of the people?',
      options: ['Article 1', 'Article 2', 'Article 3', 'Article 4'],
      correct_answer: 'Article 1',
      explanation: 'Article 1 states that all sovereign power belongs to the people of Kenya.',
    },
    {
      id: 2,
      question: 'What is the supreme law of Kenya?',
      options: ['The Penal Code', 'The Constitution', 'The Bill of Rights', 'The Elections Act'],
      correct_answer: 'The Constitution',
      explanation: 'Article 2 establishes the Constitution as the supreme law of Kenya.',
    },
    {
      id: 3,
      question: 'Which of the following is NOT a national value under Article 10?',
      options: ['Patriotism', 'National unity', 'Corporate profit', 'Rule of law'],
      correct_answer: 'Corporate profit',
      explanation: 'Article 10 lists national values including patriotism, national unity, rule of law, democracy, and participation.',
    },
    {
      id: 4,
      question: 'How many chapters are in the Kenya Constitution?',
      options: ['18', '20', '22', '24'],
      correct_answer: '18',
      explanation: 'The Kenya Constitution has 18 chapters covering various aspects of governance.',
    },
    {
      id: 5,
      question: 'Which article protects the right to life?',
      options: ['Article 25', 'Article 26', 'Article 27', 'Article 28'],
      correct_answer: 'Article 26',
      explanation: 'Article 26 guarantees the right to life to every person.',
    },
    {
      id: 6,
      question: 'What does Article 38 guarantee?',
      options: ['Right to education', 'Political rights', 'Right to health', 'Right to property'],
      correct_answer: 'Political rights',
      explanation: 'Article 38 guarantees political rights including the right to make political choices.',
    },
    {
      id: 7,
      question: 'When was the Kenya Constitution 2010 promulgated?',
      options: ['August 27, 2010', 'September 1, 2010', 'July 15, 2010', 'October 1, 2010'],
      correct_answer: 'August 27, 2010',
      explanation: 'The Constitution was promulgated on August 27, 2010, after being approved in a national referendum.',
    },
    {
      id: 8,
      question: 'Which chapter of the Constitution covers the Bill of Rights?',
      options: ['Chapter Two', 'Chapter Four', 'Chapter Six', 'Chapter Eleven'],
      correct_answer: 'Chapter Four',
      explanation: 'Chapter Four contains the Bill of Rights, protecting fundamental rights and freedoms.',
    },
    {
      id: 9,
      question: 'What is the minimum age to vote in Kenya?',
      options: ['16 years', '18 years', '21 years', '25 years'],
      correct_answer: '18 years',
      explanation: 'Article 38 gives every citizen who is at least 18 years old the right to vote.',
    },
    {
      id: 10,
      question: 'Who is the head of the county government?',
      options: ['County Commissioner', 'County Governor', 'County Speaker', 'County Secretary'],
      correct_answer: 'County Governor',
      explanation: 'Article 180 establishes the county governor as the head of the county government.',
    },
  ],
  'bill-of-rights': [
    {
      id: 1,
      question: 'Which article protects the right to life?',
      options: ['Article 26', 'Article 27', 'Article 28', 'Article 29'],
      correct_answer: 'Article 26',
      explanation: 'Article 26 guarantees the right to life to every person in Kenya.',
    },
    {
      id: 2,
      question: 'What does Article 27 guarantee?',
      options: ['Right to education', 'Equality and freedom from discrimination', 'Right to health', 'Right to housing'],
      correct_answer: 'Equality and freedom from discrimination',
      explanation: 'Article 27 guarantees equality before the law and freedom from discrimination.',
    },
    {
      id: 3,
      question: 'Which article protects human dignity?',
      options: ['Article 27', 'Article 28', 'Article 29', 'Article 30'],
      correct_answer: 'Article 28',
      explanation: 'Article 28 states that every person has inherent dignity and the right to have that dignity respected.',
    },
    {
      id: 4,
      question: 'What does Article 33 protect?',
      options: ['Right to vote', 'Freedom of expression', 'Right to education', 'Right to health'],
      correct_answer: 'Freedom of expression',
      explanation: 'Article 33 protects the right to freedom of expression, including freedom of artistic creativity.',
    },
    {
      id: 5,
      question: 'Which article protects the right to access information?',
      options: ['Article 34', 'Article 35', 'Article 36', 'Article 37'],
      correct_answer: 'Article 35',
      explanation: 'Article 35 guarantees the right to access information held by the State.',
    },
    {
      id: 6,
      question: 'What does Article 38 guarantee?',
      options: ['Right to education', 'Political rights', 'Right to health', 'Right to property'],
      correct_answer: 'Political rights',
      explanation: 'Article 38 guarantees political rights, including the right to form or participate in a political party.',
    },
    {
      id: 7,
      question: 'What does Article 40 protect?',
      options: ['Freedom of movement', 'Right to property', 'Right to education', 'Right to health'],
      correct_answer: 'Right to property',
      explanation: 'Article 40 protects the right to acquire and own property.',
    },
    {
      id: 8,
      question: 'What does Article 29 protect?',
      options: ['Freedom of expression', 'Freedom of movement', 'Freedom and security of the person', 'Freedom of religion'],
      correct_answer: 'Freedom and security of the person',
      explanation: 'Article 29 protects the right to freedom and security of the person.',
    },
  ],
};

const QUESTION_COUNT_OPTIONS = [5, 10, 15];

export default function QuizScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showTopicSelection, setShowTopicSelection] = useState(true);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadQuizHistory();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadQuizHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('quizHistory');
      if (history) {
        setQuizHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
    }
  };

  const saveQuizHistory = async (result: QuizHistory) => {
    try {
      const updatedHistory = [result, ...quizHistory];
      await AsyncStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
      setQuizHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving quiz history:', error);
    }
  };

  const startQuiz = () => {
    if (!selectedTopic) {
      Alert.alert('Please select a topic');
      return;
    }

    setIsLoading(true);
    const topicQuestions = QUIZ_DATA[selectedTopic as keyof typeof QUIZ_DATA] || [];
    
    if (topicQuestions.length === 0) {
      Alert.alert('No questions available for this topic');
      setIsLoading(false);
      return;
    }

    const shuffled = [...topicQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(null);
    setShowResults(false);
    setShowTopicSelection(false);
    setTimeLeft(questionCount * 30);
    setTotalTime(0);
    setCorrectCount(0);
    startTimeRef.current = Date.now();
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleQuizEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setIsLoading(false);
  };

  const handleQuizEnd = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setTotalTime(totalTimeTaken);
    
    let correct = 0;
    currentQuestions.forEach((q, index) => {
      const userAnswer = selectedAnswers[index];
      if (userAnswer === q.correct_answer) {
        correct++;
      }
    });
    setCorrectCount(correct);
    
    const finalScore = Math.round((correct / currentQuestions.length) * 100);
    setScore(finalScore);
    setShowResults(true);
    
    const historyEntry: QuizHistory = {
      id: Date.now().toString(),
      topic: selectedTopic!,
      score: finalScore,
      totalQuestions: currentQuestions.length,
      date: new Date().toISOString(),
      timeTaken: totalTimeTaken,
      correctAnswers: correct,
    };
    saveQuizHistory(historyEntry);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
    setShowAnswerExplanation(true);
    
    // Animate feedback
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const goToNextQuestion = () => {
    setShowAnswerExplanation(false);
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleQuizEnd();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswerExplanation(false);
    }
  };

  const resetQuiz = () => {
    setSelectedTopic(null);
    setQuestionCount(10);
    setShowTopicSelection(true);
    setCurrentQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(null);
    setShowResults(false);
    setTimeLeft(0);
    setShowAnswerExplanation(false);
    setCorrectCount(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '📚';
    return '💪';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return '🌟 Excellent! You are a civic champion!';
    if (score >= 60) return '👍 Good job! Keep learning about your rights!';
    if (score >= 40) return '📚 Keep going! Review the Constitution to improve!';
    return '💪 Don\'t give up! Every attempt helps you learn more!';
  };

  // ============================================
  // TOPIC SELECTION SCREEN
  // ============================================
  if (showTopicSelection) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>📝 Civic Quiz</Text>
              <TouchableOpacity style={styles.historyIconButton} onPress={() => setShowHistory(true)}>
                <Ionicons name="time-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>Test and improve your civic knowledge!</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a Topic</Text>
              <View style={styles.topicsGrid}>
                {QUIZ_TOPICS.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[
                      styles.topicCard,
                      selectedTopic === topic.id && styles.topicCardSelected,
                    ]}
                    onPress={() => setSelectedTopic(topic.id)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={selectedTopic === topic.id ? topic.gradient : ['#F5F5F5', '#F5F5F5']}
                      style={styles.topicGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.topicIcon}>{topic.icon}</Text>
                    </LinearGradient>
                    <Text style={[styles.topicName, selectedTopic === topic.id && styles.topicNameSelected]}>
                      {topic.name}
                    </Text>
                    <Text style={styles.topicDescription} numberOfLines={2}>
                      {topic.description}
                    </Text>
                    {selectedTopic === topic.id && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Questions</Text>
              <View style={styles.questionCountContainer}>
                {QUESTION_COUNT_OPTIONS.map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.questionCountButton,
                      questionCount === count && styles.questionCountButtonSelected,
                    ]}
                    onPress={() => setQuestionCount(count)}
                  >
                    <Text
                      style={[
                        styles.questionCountText,
                        questionCount === count && styles.questionCountTextSelected,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.startButton,
                !selectedTopic && styles.startButtonDisabled,
              ]}
              onPress={startQuiz}
              disabled={!selectedTopic || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.startButtonText}>🚀 Start Quiz</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📊 Quiz History</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {quizHistory.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Ionicons name="trophy-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyHistoryText}>No quiz attempts yet!</Text>
                    <Text style={styles.emptyHistorySubtext}>Complete a quiz to track your progress</Text>
                  </View>
                ) : (
                  quizHistory.map((entry) => (
                    <View key={entry.id} style={styles.historyItem}>
                      <View style={styles.historyItemLeft}>
                        <View style={styles.historyTopicRow}>
                          <Text style={styles.historyTopicIcon}>
                            {QUIZ_TOPICS.find(t => t.id === entry.topic)?.icon || '📚'}
                          </Text>
                          <Text style={styles.historyTopic}>
                            {QUIZ_TOPICS.find(t => t.id === entry.topic)?.name || entry.topic}
                          </Text>
                        </View>
                        <Text style={styles.historyDate}>
                          {new Date(entry.date).toLocaleDateString()} • {entry.timeTaken}s
                        </Text>
                        <Text style={styles.historyDetails}>
                          {entry.correctAnswers}/{entry.totalQuestions} correct
                        </Text>
                      </View>
                      <View style={styles.historyItemRight}>
                        <Text style={[styles.historyScore, { color: getScoreColor(entry.score) }]}>
                          {entry.score}%
                        </Text>
                        <Text style={styles.historyScoreEmoji}>
                          {getScoreEmoji(entry.score)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ============================================
  // QUIZ SCREEN
  // ============================================
  if (!showResults && currentQuestions.length > 0) {
    const question = currentQuestions[currentIndex];
    const isAnswered = selectedAnswers[currentIndex] !== undefined;
    const progress = ((currentIndex + 1) / currentQuestions.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={resetQuiz} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.quizHeaderCenter}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentIndex + 1} of {currentQuestions.length}
              </Text>
            </View>
          </View>
          <View style={styles.timerContainer}>
            <Ionicons name="timer-outline" size={20} color={timeLeft < 30 ? '#F44336' : '#666'} />
            <Text style={[styles.timerText, timeLeft < 30 && styles.timerWarning]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
          <ScrollView style={styles.quizContent} showsVerticalScrollIndicator={false}>
            <View style={styles.questionCard}>
              <View style={styles.questionNumberContainer}>
                <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>
                <View style={styles.questionBadge}>
                  <Text style={styles.questionBadgeText}>
                    {Math.round(((currentIndex + 1) / currentQuestions.length) * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>

            <View style={styles.optionsContainer}>
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentIndex] === option;
                const isCorrect = option === question.correct_answer;
                const showResult = isAnswered;

                let optionStyle = styles.optionButton;
                let textStyle = styles.optionText;
                
                if (isSelected && showResult) {
                  if (isCorrect) {
                    optionStyle = [styles.optionButton, styles.optionCorrect];
                    textStyle = [styles.optionText, styles.optionTextCorrect];
                  } else {
                    optionStyle = [styles.optionButton, styles.optionWrong];
                    textStyle = [styles.optionText, styles.optionTextWrong];
                  }
                } else if (showResult && isCorrect) {
                  optionStyle = [styles.optionButton, styles.optionCorrect];
                  textStyle = [styles.optionText, styles.optionTextCorrect];
                } else if (isSelected) {
                  optionStyle = [styles.optionButton, styles.optionSelected];
                  textStyle = [styles.optionText, styles.optionTextSelected];
                }

                const letters = ['A', 'B', 'C', 'D'];

                return (
                  <TouchableOpacity
                    key={idx}
                    style={optionStyle}
                    onPress={() => !isAnswered && handleAnswerSelect(option)}
                    disabled={isAnswered}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLetterContainer}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {letters[idx]}
                      </Text>
                    </View>
                    <Text style={textStyle}>{option}</Text>
                    {showResult && isCorrect && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                    {isSelected && !isCorrect && showResult && (
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {isAnswered && question.explanation && (
              <View style={styles.explanationContainer}>
                <View style={styles.explanationHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#1976D2" />
                  <Text style={styles.explanationTitle}>Explanation</Text>
                </View>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            )}

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                onPress={goToPreviousQuestion}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? '#ccc' : '#333'} />
                <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButtonNext, !isAnswered && styles.navButtonDisabled]}
                onPress={goToNextQuestion}
                disabled={!isAnswered}
              >
                <Text style={[styles.navButtonText, !isAnswered && styles.navButtonTextDisabled]}>
                  {currentIndex === currentQuestions.length - 1 ? 'Finish' : 'Next'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={!isAnswered ? '#ccc' : '#333'}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RESULTS SCREEN
  // ============================================
  if (showResults && score !== null) {
    return (
      <SafeAreaView style={[styles.container, styles.resultsContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.resultsHeader}>
            <View style={styles.resultsEmojiContainer}>
              <Text style={styles.resultsEmoji}>{getScoreEmoji(score)}</Text>
            </View>
            <Text style={styles.resultsTitle}>Quiz Complete!</Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}%
            </Text>
            <Text style={styles.scoreSubtext}>{getScoreMessage(score)}</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentQuestions.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statItem, styles.statItemCorrect]}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={[styles.statItem, styles.statItemWrong]}>
              <Text style={[styles.statValue, { color: '#F44336' }]}>{currentQuestions.length - correctCount}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.reviewButton} onPress={resetQuiz}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.reviewButtonText}>Try Another Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.historyButtonText}>View History</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* History Modal */}
        <Modal
          visible={showHistory}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHistory(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📊 Quiz History</Text>
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {quizHistory.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Ionicons name="trophy-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyHistoryText}>No quiz attempts yet!</Text>
                  </View>
                ) : (
                  quizHistory.map((entry) => (
                    <View key={entry.id} style={styles.historyItem}>
                      <View style={styles.historyItemLeft}>
                        <View style={styles.historyTopicRow}>
                          <Text style={styles.historyTopicIcon}>
                            {QUIZ_TOPICS.find(t => t.id === entry.topic)?.icon || '📚'}
                          </Text>
                          <Text style={styles.historyTopic}>
                            {QUIZ_TOPICS.find(t => t.id === entry.topic)?.name || entry.topic}
                          </Text>
                        </View>
                        <Text style={styles.historyDate}>
                          {new Date(entry.date).toLocaleDateString()} • {entry.timeTaken}s
                        </Text>
                      </View>
                      <View style={styles.historyItemRight}>
                        <Text style={[styles.historyScore, { color: getScoreColor(entry.score) }]}>
                          {entry.score}%
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  historyIconButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 14,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  topicCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topicCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
  },
  topicGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicIcon: {
    fontSize: 28,
  },
  topicName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 4,
  },
  topicNameSelected: {
    color: '#4CAF50',
  },
  topicDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 15,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  questionCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  questionCountButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    alignItems: 'center',
  },
  questionCountButtonSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
  },
  questionCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  questionCountTextSelected: {
    color: '#4CAF50',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  historyButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },

  // ============================================
  // QUIZ SCREEN STYLES
  // ============================================
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  quizHeaderCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  timerWarning: {
    color: '#F44336',
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  questionNumberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  questionBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  questionBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    color: '#1a1a2e',
    lineHeight: 27,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 16,
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  optionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
  },
  optionCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionWrong: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionLetterContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionLabelSelected: {
    color: '#4CAF50',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
    lineHeight: 22,
  },
  optionTextSelected: {
    color: '#4CAF50',
  },
  optionTextCorrect: {
    color: '#4CAF50',
  },
  optionTextWrong: {
    color: '#F44336',
  },
  explanationContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  navButtonNext: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    color: '#1a1a2e',
    marginHorizontal: 4,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },

  // ============================================
  // RESULTS SCREEN STYLES
  // ============================================
  resultsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  resultsEmojiContainer: {
    marginBottom: 12,
  },
  resultsEmoji: {
    fontSize: 56,
  },
  resultsTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statItemCorrect: {
    backgroundColor: '#E8F5E9',
  },
  statItemWrong: {
    backgroundColor: '#FFEBEE',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // ============================================
  // MODAL STYLES
  // ============================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyTopicIcon: {
    fontSize: 16,
  },
  historyTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  historyDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyItemRight: {
    alignItems: 'center',
    marginLeft: 12,
  },
  historyScore: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  historyScoreEmoji: {
    fontSize: 16,
    marginTop: 2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
});