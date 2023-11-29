import { useNavigation } from "@react-navigation/native";
import React from 'react';
import {SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity} from 'react-native';

const TakeOrderScreen = () => {
  const [text, onChangeText] = React.useState('');
  return (
    <SafeAreaView>
      <Text
      style={styles.header}>ENTER ORDER NUMBER:</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />

      <TouchableOpacity
      style={styles.takeOrder}>
         <Text style={styles.text}>Start Order</Text>
         </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  text: {
   color: 'white',
   fontSize: 16,
  },
  header: {
   position: "relative",
   color: '#eb4c34',
   fontSize: 20,
   height: 50,
   padding: 10,
   left: 75,
  },
  takeOrder: {
   backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 0,
    position: 'absolute',
    top: 110,
    right: 10,
  },
});

export default TakeOrderScreen;