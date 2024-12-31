import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import FormEditor from './FormEditor';

const App = () => {
    return (
        <SafeAreaView>
            <ScrollView>
                <FormEditor />
            </ScrollView>
        </SafeAreaView>
    );
};

export default App;
