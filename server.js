import express from 'express';
import { Ollama } from 'ollama';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ollama = new Ollama({ host: 'http://localhost:11434' });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Stockage des conversations en mémoire serveur
const conversations = new Map();

function cleanResponse(text) {
    let cleaned = text
        .replace(/<\|[^|]+\|>/g, '')
        .replace(/<\/s>/g, '')
        .replace(/<s>/g, '')
        .trim();

    return cleaned;
}

// Créer ou récupérer une conversation
app.post('/api/conversation', (req, res) => {
    const { conversationId, title } = req.body;

    if (!conversations.has(conversationId)) {
        conversations.set(conversationId, {
            id: conversationId,
            title: title || 'Nouvelle conversation',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    res.json(conversations.get(conversationId));
});

// Envoyer un message avec streaming
app.post('/api/chat', async (req, res) => {
    const { message, conversationId } = req.body;

    if (!conversationId) {
        return res.status(400).json({ error: 'conversationId requis' });
    }

    try {
        // Récupérer ou créer la conversation
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, {
                id: conversationId,
                title: 'Nouvelle conversation',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        const conversation = conversations.get(conversationId);

        // Ajouter le message utilisateur
        conversation.messages.push({
            role: 'user',
            content: message
        });

        // Configuration pour le streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';

        // Appeler Ollama avec streaming
        const stream = await ollama.chat({
            model: 'kai',
            messages: conversation.messages,
            stream: true,
            options: {
                temperature: 0.8,
                num_predict: 4000
            }
        });

        // Envoyer les chunks au client
        for await (const chunk of stream) {
            const content = chunk.message.content;
            fullResponse += content;

            // Envoyer le chunk au client
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }

        // Nettoyer et sauvegarder la réponse complète
        const cleanedResponse = cleanResponse(fullResponse);

        conversation.messages.push({
            role: 'assistant',
            content: cleanedResponse
        });

        conversation.updatedAt = new Date().toISOString();

        // Envoyer le signal de fin
        res.write(`data: ${JSON.stringify({ done: true, fullResponse: cleanedResponse })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Erreur:', error);
        res.write(`data: ${JSON.stringify({ error: 'Erreur lors de la communication avec Ollama' })}\n\n`);
        res.end();
    }
});

// Mettre à jour le titre d'une conversation
app.patch('/api/conversation/:id', (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if (conversations.has(id)) {
        const conversation = conversations.get(id);
        conversation.title = title;
        conversation.updatedAt = new Date().toISOString();
        res.json(conversation);
    } else {
        res.status(404).json({ error: 'Conversation non trouvée' });
    }
});

// Supprimer une conversation
app.delete('/api/conversation/:id', (req, res) => {
    const { id } = req.params;

    if (conversations.has(id)) {
        conversations.delete(id);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Conversation non trouvée' });
    }
});

// Route spéciale pour générer un titre (avant la ligne app.listen)
app.post('/api/generate-title', async (req, res) => {
    const { message } = req.body;

    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullResponse = '';

        const stream = await ollama.chat({
            model: 'kai',
            messages: [{
                role: 'user',
                content: `Génère un titre court et descriptif (3-5 mots maximum) pour une conversation qui commence par : "${message}". Réponds UNIQUEMENT avec le titre, sans guillemets, sans ponctuation finale, sans explication.`
            }],
            stream: true,
            options: {
                temperature: 0.7,
                num_predict: 50
            }
        });

        for await (const chunk of stream) {
            const content = chunk.message.content;
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }

        const cleanedTitle = fullResponse
            .trim()
            .replace(/^["']|["']$/g, '')
            .replace(/[.!?]$/g, '')
            .substring(0, 50);

        res.write(`data: ${JSON.stringify({ done: true, title: cleanedTitle })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Erreur génération titre:', error);
        res.write(`data: ${JSON.stringify({ error: 'Erreur génération titre' })}\n\n`);
        res.end();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});