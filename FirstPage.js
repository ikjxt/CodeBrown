import React, { useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

const FirstPage = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('SignIn'); // Navigate to SignIn.js after 3.2 seconds
    }, 3200); // 3200 milliseconds = 3.2 seconds

    return () => clearTimeout(timer); // Clean up the timer if the component unmounts
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Video
        source={require('./assets/Intro.mp4')} // Path to your video file
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={styles.video} // Updated to use a custom style
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    alignSelf: 'center', // Center the video
    // Adjust this value to shift the video to the right
    // You might need to adjust the width and height depending on your requirements
  },
});

export default FirstPage;

