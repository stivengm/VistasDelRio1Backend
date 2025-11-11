const { Router } = require('express');
const { db } = require('../firebase');

const eventsRoute = Router();

eventsRoute.post('/add-event', async (req, res) => {
    try {
        const { address, date, name, description, place } = req.body;

        if (!address || !date || !name || !description || !place) {
            return res.status(400).json({
                code: '004',
                message: 'Hace falta información para guardar en los eventos',
            });
        }

        const newEvent = {
            address,
            date,
            name,
            description,
            place,
            createdAt: new Date(),
        }

        await db.collection('events').add(newEvent);

        return res.status(201).json({
            code: '001',
            message: 'Evento registrado'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el evento' });
    }
});

eventsRoute.get('/get-events', async (req, res) => {
    try {
        const querySnapshotEvents =  await db.collection('events').get();
        const events = querySnapshotEvents.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.status(200).json({
            code: '001',
            message: 'Resultado de todos los eventos',
            data: events
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

module.exports = eventsRoute;