import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import firebase from 'firebase';
import 'firebase/firestore';

/* Initialize Firebase
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
*/

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); 
}

const db = firebase.firestore();

const MessagingScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const unsubscribe = db.collection('messages').onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(data);
    });
    
    return () => unsubscribe();
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      db.collection('messages').add({
        text: inputMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      setInputMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map(({ id, text }) => (
          <Text key={id} style={styles.message}>{text}</Text>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        value={inputMessage}
        onChangeText={setInputMessage}
        placeholder="Type your message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end'
  },
  messagesContainer: {
    maxHeight: '80%'
  },
  message: {
    marginBottom: 10,
    fontSize: 16
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5
  }
});

export default MessagingScreen;