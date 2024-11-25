//backend index
import 'dotenv/config';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import sequelize from './database.js';
import technicianRoutes from './routes/technicians.js';
import clientRoutes from './routes/clients.js';
import reportRoutes from './routes/reports.js';
import taskRoutes from './routes/tasks.js';
import warehouseRouter from './routes/warehouse.js';
import superagent from 'superagent';
import path from 'path';
import userRoutes from './routes/users.js'; // Import routeru pro uživatele

import './models/associations.js'; // Importujte asociace po definici modelů

// Načtení proměnných prostředí
dotenv.config();

// Inicializace aplikace Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Povolit přístup ze všech domén, můžeš to změnit pro specifickou doménu kvůli bezpečnosti
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Middleware pro práci s JSON daty

// Použití technických, klientských a report routes
app.use('/api/Users', userRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tasks', taskRoutes); // Použití /tasks route
app.use('/api/warehouse', warehouseRouter); // Připojení skladu
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/warehouse', warehouseRouter);



// Proxy route pro výpočet vzdálenosti pomocí Google API
app.get('/api/distance', async (req, res) => {
    // Logování celého objektu query
    console.log('Query parametry:', req.query);
  const { origins, destinations } = req.query;

  // Logování přijatých parametrů
  console.log('Celý požadavek:', req.query);
console.log('Parametr origins:', req.query.origins);
console.log('Parametr destinations:', req.query.destinations);
  console.log('Přijaté parametry:', { origins, destinations });

  // Validace parametrů
  if (!origins || !destinations) {
    console.error('Chyba: origins nebo destinations nejsou nastavené.', {
      origins,
      destinations,
    });
    return res.status(400).json({
      error: 'Origins nebo destinations nejsou správně nastavené.',
      detail: { origins, destinations },
    });
  }

  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

  // Logování načtení klíče
  console.log('GOOGLE_MAPS_API_KEY:', GOOGLE_MAPS_API_KEY);

  // Ověření, že API klíč je dostupný
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('API klíč není nastaven.');
    return res.status(500).json({
      error: 'API klíč není nastaven. Ujistěte se, že je GOOGLE_MAPS_API_KEY definován ve vašem .env souboru.',
    });
  }

  try {
    // Logování parametrů volání Google API
    console.log(`Volání Google API s origins: ${origins}, destinations: ${destinations}`);

    const response = await superagent
      .get('https://maps.googleapis.com/maps/api/distancematrix/json')
      .query({
        origins,
        destinations,
        key: GOOGLE_MAPS_API_KEY,
      });

    // Logování celé odpovědi Google API
    console.log('Kompletní odpověď Google API:', response.body);

    // Kontrola, zda je odpověď od Google API platná
    if (response.body && response.body.status === 'OK' && response.body.rows.length > 0) {
      const data = response.body;
      console.log('Platná odpověď Google API:', data);
      res.json(data); // Odeslání odpovědi zpět klientovi
    } else {
      console.error('Neplatná odpověď z Google API:', response.body);
      res.status(500).json({
        error: 'Nastala chyba při získávání dat z Google API',
        detail: response.body,
      });
    }
  } catch (error) {
    // Logování chyby při volání Google API
    console.error('Chyba při volání Google API:', error.response ? error.response.text : error);
    res.status(500).json({
      error: 'Nastala chyba při volání Google API',
      detail: error.response ? error.response.text : error,
    });
  }
});



// Synchronizace databáze
// Synchronizace databáze
sequelize.sync({ alter: true }) // Použijeme alter pro přidání nových tabulek bez mazání existujících dat
  .then(async () => {
    console.log('Databáze připojena a tabulky synchronizovány');
    app.listen(PORT, () => {
      console.log(`Server běží na portu: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Chyba při připojování k databázi:', error);
  });

// Základní trasa pro ověření funkčnosti serveru
app.get('/', (req, res) => {
  res.send('Solar Servis API běží...');
});
