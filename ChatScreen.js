import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'asc'), limit(20)), (snapshot) => {
      const updatedMessages = [];
      snapshot.forEach((doc) => {
        updatedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(updatedMessages);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const { uid, email } = auth.currentUser;
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{item.text} - {item.email}</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }} // Add flexGrow to ensure the content expands to fill the space
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    maxWidth: '80%',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 60, // Set a fixed height for the input container
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
