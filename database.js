import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Načtení proměnných prostředí (není třeba pro Railway, ale zůstává, pokud běžíš lokálně)
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // Název databáze
  process.env.DB_USER,      // Uživatelské jméno
  process.env.DB_PASSWORD,  // Heslo k databázi
  {
    host: process.env.DB_HOST, // Hostitel databáze (např. postgres.railway.internal)
    dialect: 'postgres',       // Dialekt databáze - PostgreSQL
    port: process.env.DB_PORT, // Port (5432)
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // toto je často potřeba pro cloudové služby
      }
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Připojení k databázi bylo úspěšné.');
  })
  .catch(err => {
    console.error('Chyba při připojování k databázi:', err);
  });

export default sequelize;
