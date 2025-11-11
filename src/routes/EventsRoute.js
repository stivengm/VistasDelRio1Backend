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
        const querySnapshotRoles =  await db.collection('events').get();

        const allRoles = {};
        querySnapshotRoles.forEach((doc) => {
          const role = doc.data();
          allRoles[role.roleId] = role.roleName;
        });

        const querySnapshot = await db.collection('users').get();

        const users = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log(data.roleId);
          console.log(allRoles);

          const { password, ...restOfData } = data;

          const roleName = allRoles[data.roleId] || 'Sin rol asignado';
          return {
            id: doc.id,
            ...restOfData,
            role: roleName
          };
        });
  
        res.status(200).json({
            code: '001',
            message: 'Resultado de todos los usuarios de la base de datos',
            data: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

module.exports = eventsRoute;