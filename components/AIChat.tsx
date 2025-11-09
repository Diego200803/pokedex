//AIChat.tsx
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
  } from 'react-native';
  import { useState, useRef, useEffect } from 'react';
  import { GeminiService, Message } from '../services/geminiService';
  
  interface AIChatProps {
    geminiService: GeminiService;
  }
  
  export default function AIChat({ geminiService }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
      {
        role: 'assistant',
        content: '¡Hola! Soy tu asistente Pokémon. Pregúntame lo que quieras sobre los Pokémon de tu Pokédex. 🎮',
        timestamp: Date.now(),
      },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);
  
    useEffect(() => {
      // Scroll al final cuando hay nuevos mensajes
      if (messages.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, [messages]);
  
    const handleSend = async () => {
      if (!inputText.trim() || isLoading) return;
  
      const userMessage: Message = {
        role: 'user',
        content: inputText.trim(),
        timestamp: Date.now(),
      };
  
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);
  
      try {
        const response = await geminiService.sendMessage(inputText.trim());
        
        const aiMessage: Message = {
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
  
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error en handleSend:', error);
        
        let errorText = 'Lo siento, hubo un error al procesar tu mensaje.';
        
        if (error instanceof Error) {
          errorText = error.message;
        }
        
        const errorMessage: Message = {
          role: 'assistant',
          content: errorText,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };
  
    const renderMessage = ({ item }: { item: Message }) => {
      const isUser = item.role === 'user';
      
      return (
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText
            ]}>
              {item.content}
            </Text>
          </View>
        </View>
      );
    };
  
    const suggestedQuestions = [
      '¿Cuál es el mejor Pokémon tipo fuego?',
      'Compara Pikachu vs Raichu',
      '¿Qué Pokémon son buenos contra tipo agua?',
    ];
  
    const handleSuggestedQuestion = (question: string) => {
      setInputText(question);
    };
  
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💬 Chat Pokémon AI</Text>
          <Text style={styles.headerSubtitle}>Pregunta sobre cualquier Pokémon</Text>
        </View>
  
        {messages.length === 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Prueba preguntando:</Text>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => handleSuggestedQuestion(question)}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
  
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.timestamp.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
  
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#DC2626" />
            <Text style={styles.loadingText}>Pensando...</Text>
          </View>
        )}
  
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9FAFB',
    },
    header: {
      backgroundColor: '#DC2626',
      paddingTop: 60,
      paddingBottom: 16,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    headerTitle: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    headerSubtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 14,
      marginTop: 4,
    },
    suggestionsContainer: {
      padding: 16,
      backgroundColor: '#fff',
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    suggestionsTitle: {
      fontSize: 14,
      color: '#666',
      marginBottom: 12,
      fontWeight: '600',
    },
    suggestionButton: {
      backgroundColor: '#FEF2F2',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#FEE2E2',
    },
    suggestionText: {
      color: '#DC2626',
      fontSize: 14,
    },
    messagesList: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    messageContainer: {
      marginBottom: 12,
      maxWidth: '80%',
    },
    userMessageContainer: {
      alignSelf: 'flex-end',
    },
    aiMessageContainer: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
    },
    userBubble: {
      backgroundColor: '#DC2626',
      borderBottomRightRadius: 4,
    },
    aiBubble: {
      backgroundColor: '#fff',
      borderBottomLeftRadius: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    userText: {
      color: '#fff',
    },
    aiText: {
      color: '#1F2937',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    loadingText: {
      marginLeft: 8,
      color: '#666',
      fontSize: 14,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      alignItems: 'flex-end',
    },
    input: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 16,
      maxHeight: 100,
      marginRight: 8,
    },
    sendButton: {
      backgroundColor: '#DC2626',
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: '#D1D5DB',
    },
    sendButtonText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });