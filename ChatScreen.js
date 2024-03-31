import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const auth = getAuth();
  const db = getFirestore();
  const flatListRef = useRef();

  useEffect(() => {
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(100));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const updatedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(updatedMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const { uid, email } = auth.currentUser || {};
    const createdAt = new Date();
    const message = {
      text: inputText,
      userId: uid,
      email: email,
      createdAt: createdAt.toISOString(),
    };

    try {
      await addDoc(collection(db, 'messages'), message);
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.email === auth.currentUser?.email ? styles.currentUserBubble : styles.otherUserBubble
          ]}>
            <Text style={styles.senderName}>{item.email}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContentContainer}
        onContentSizeChange={scrollToBottom}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5', // Light grey background
  },
  listContentContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  currentUserBubble: {
    backgroundColor: '#DCF8C6', // Light green bubble for current user
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  otherUserBubble: {
    backgroundColor: '#FFFFFF', // White bubble for others
    marginLeft: 10,
  },
  senderName: {
    fontSize: 12,
    color: '#6C757D', // Dark grey color for the sender's name
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#212529', // Dark color for the message text
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFF', // White background for the input area
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#F8F9FA', // Very light grey background for the input field
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF', // Bright blue background for the send button
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF', // White color for the send button text
    fontSize: 16,
  },
});

export default ChatScreen;
