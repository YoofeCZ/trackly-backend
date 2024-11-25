import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Načíst proměnné prostředí ze souboru .env nebo Railway nastavení
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // Název databáze
  process.env.DB_USER,      // Uživatelské jméno
  process.env.DB_PASSWORD,  // Heslo
  {
    host: process.env.DB_HOST, // Adresa hosta
    dialect: 'postgres',       // Dialekt databáze
    port: process.env.DB_PORT  // Port (výchozí je 5432)
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
