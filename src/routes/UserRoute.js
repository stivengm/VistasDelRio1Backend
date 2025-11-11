const { Router } = require('express');
const { db } = require('../firebase');

const bcrypt = require('bcrypt');

const router = Router();

router.get('/all-users', async (req, res) => {
    try {
        const querySnapshotRoles =  await db.collection('roles').get();

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

router.get('/all-roles', async (req, res) => {
    try {
        const querySnapshotRoles =  await db.collection('roles').get();

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

            const roleName = allRoles[data.roleId] || 'Sin rol asignado';
            return {
              id: doc.id,
              ...data,
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

router.post('/register-user', async (req, res) => {
    try {
        const { torre, apartamento, fullName, email, password, phone, roleId } = req.body;

        const userExists = await db.collection('users').where('email', '==', email).get();
        if (!userExists.empty) {
            return res.status(400).json({
                code: '004',
                message: 'El correo ya está registrado',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            torre,
            apartamento,
            fullName,
            email,
            password: hashedPassword,
            phone,
            roleId,
            createdAt: new Date(),
        };

        const userRef = await db.collection('users').add(newUser);

        res.status(201).json({
            code: '001',
            message: 'Usuario registrado correctamente',
            data: { id: userRef.id, ...newUser, password: undefined },
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

router.post('/login-user', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          code: '002',
          message: 'Email y contraseña son requeridos',
        });
      }
  
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
        return res.status(404).json({
          code: 'LU003',
          message: 'Usuario no encontrado',
        });
      }
  
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
  
      const isValidPassword = await bcrypt.compare(password, userData.password);
      if (!isValidPassword) {
        return res.status(401).json({
          code: 'LU004',
          message: 'Contraseña incorrecta',
        });
      }
  
      let roleName = 'Sin rol asignado';
      if (userData.roleId) {
        const roleSnapshot = await db
          .collection('roles')
          .where('roleId', '==', userData.roleId)
          .get();
  
        if (!roleSnapshot.empty) {
          roleName = roleSnapshot.docs[0].data().roleName;
        }
      }
  
      const userRef = db.collection('users').doc(userDoc.id);
      await userRef.update({
        lastLogin: new Date(),
      });
  
      res.status(200).json({
        code: 'LU001',
        message: 'Login exitoso',
        data: {
          id: userDoc.id,
          torre: userData.torre,
          apartamento: userData.apartamento,
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          roleId: userData.roleId,
          roleName,
          createdAt: userData.createdAt,
          lastLogin: new Date(),
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        code: 'LU002',
        message: 'Error interno en el login',
      });
    }
});

module.exports = router;