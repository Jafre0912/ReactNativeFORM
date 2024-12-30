const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection (without deprecated options)
mongoose.connect('mongodb://localhost:27017/form-builder')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);  // Exit if DB fails
    });

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('📁 uploads/ directory created.');
}

// Schemas
const questionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    label: { type: String, required: true },
    options: [String],
    image: String
});

const responseSchema = new mongoose.Schema({
    formId: { type: mongoose.Schema.Types.ObjectId, required: true },
    answers: { type: [String], required: true }
});

const formSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    headerImage: String,
    questions: { type: [questionSchema], required: true }
});

const Form = mongoose.model('Form', formSchema);
const Response = mongoose.model('Response', responseSchema);

// Multer Storage (for image uploads)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${uuidv4()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Routes

// Create Form Route
app.post('/create', async (req, res) => {
    try {
        const { title, questions } = req.body;
        
        // Validation check
        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Title and questions are required' });
        }

        const newForm = new Form(req.body);
        await newForm.save();
        res.status(201).json({ message: '✅ Form Created', formId: newForm._id });
    } catch (error) {
        console.error('❌ Error creating form:', error);
        res.status(500).json({ message: 'Failed to create form', error });
    }
});

// Get Forms Route
app.get('/forms', async (req, res) => {
    try {
        const forms = await Form.find();
        res.json(forms);
    } catch (error) {
        console.error('❌ Error fetching forms:', error);
        res.status(500).json({ message: 'Failed to fetch forms' });
    }
});

// Submit Response Route
app.post('/submit/:formId', async (req, res) => {
    try {
        const { formId } = req.params;
        const { answers } = req.body;

        // Check if form exists
        const formExists = await Form.findById(formId);
        if (!formExists) {
            return res.status(404).json({ message: 'Form not found' });
        }

        // Validate answers
        if (!answers || answers.length === 0) {
            return res.status(400).json({ message: 'Answers are required' });
        }

        const response = new Response({ formId, answers });
        await response.save();
        res.status(201).json({ message: '✅ Response Submitted' });
    } catch (error) {
        console.error('❌ Error submitting response:', error);
        res.status(500).json({ message: 'Failed to submit response' });
    }
});

// Upload Image Route
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Fallback Route
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
