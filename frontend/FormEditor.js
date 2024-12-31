import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image } from 'react-native';
//import axios from 'axios';
import axios from 'axios';
import tailwind from 'tailwind-rn';

const FormEditor = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);

    const addQuestion = (type) => {
        const newQuestion = { type, label: '', options: [], image: '' };
        setQuestions([...questions, newQuestion]);
    };

    const handleUpload = async (index, file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post('http://localhost:5000/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const updatedQuestions = [...questions];
        updatedQuestions[index].image = res.data.imageUrl;
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async () => {
        await axios.post('http://localhost:5000/create', {
            title,
            description,
            questions
        });
        alert('Form Created!');
    };

    return (
        <View style={tailwind('p-4')}> 
            <Text style={tailwind('text-lg font-bold')}>Form Title</Text>
            <TextInput style={tailwind('border p-2 mb-4')} value={title} onChangeText={setTitle} />
            
            <Text style={tailwind('text-lg font-bold')}>Description</Text>
            <TextInput style={tailwind('border p-2 mb-4')} value={description} onChangeText={setDescription} />

            <Button title="Add Text Question" onPress={() => addQuestion('Text')} />
            <Button title="Add Grid Question" onPress={() => addQuestion('Grid')} />
            <Button title="Add Checkbox Question" onPress={() => addQuestion('CheckBox')} />

            {questions.map((q, index) => (
                <View key={index} style={tailwind('mt-4')}>
                    <Text>Question {index + 1}</Text>
                    <TextInput
                        placeholder="Enter question label"
                        value={q.label}
                        onChangeText={(text) => {
                            const updated = [...questions];
                            updated[index].label = text;
                            setQuestions(updated);
                        }}
                    />
                    {q.image && <Image source={{ uri: q.image }} style={tailwind('w-20 h-20')} />}
                    <Button
                        title="Upload Image"
                        onPress={() => {
                            // You would handle file picking here using ImagePicker
                            // Once file picked, pass to handleUpload with the correct index
                        }}
                    />
                </View>
            ))}

            <Button title="Submit Form" onPress={handleSubmit} />
        </View>
    );
};

export default FormEditor;
