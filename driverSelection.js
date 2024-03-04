// DriverSelection.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const DriverSelection = ({ onSelectDriver }) => {
    const [drivers, setDrivers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDrivers = async () => {
            setIsLoading(true);
            const q = query(collection(db, "users"), where("role", "==", "driver"));
            const querySnapshot = await getDocs(q);
            const fetchedDrivers = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setDrivers(fetchedDrivers);
            setIsLoading(false);
        };

        fetchDrivers();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onSelectDriver(item)}>
            <Text style={styles.title}>{item.firstName} {item.lastName}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={drivers}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 16,
    },
});

export default DriverSelection;
