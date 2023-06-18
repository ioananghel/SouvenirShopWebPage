DROP TYPE IF EXISTS categ_produs;
DROP TYPE IF EXISTS tipuri_produse;

CREATE TYPE categ_produse AS ENUM( 'racewear', 'team merchandise', 'art', 'limited edition', 'replicas','body work');
CREATE TYPE tipuri_produse AS ENUM('mechanical', 'clothing', 'art');
CREATE TYPE echipe AS ENUM('Mercedes', 'Red Bull', 'Aston Martin', 'Alpine', 'Ferrari', 'McLaren', 'Alfa Romeo', 'AlphaTauri', 'Williams', 'Haas');
CREATE TYPE soferi AS ENUM('Lewis Hamilton', 'Max Verstappen', 'George Russel', 'Sergio Perez', 'Lando Norris', 'Charles Leclerc', 'Carlos Sainz', 'Oscar Piastri', 'Valtteri Bottas', 'Esteban Ocon', 'Fernando Alonso', 'Guanyu Zhou', 'Lance Stroll', 'Nick DeVries', 'Kevin Magnussen', 'Pierre Gasly', 'Yuki Tsunoda', 'Nico Hulkenberg', 'Logan Seargent', 'Alex Albon');



CREATE TABLE IF NOT EXISTS produse (
   id serial PRIMARY KEY,
   nume VARCHAR(200) UNIQUE NOT NULL,
   descriere TEXT,
   pret NUMERIC(8,2) NOT NULL,
   driver VARCHAR(100),
   team VARCHAR(50),
   tip_produs tipuri_produse DEFAULT 'mechanical',
   an_fabricatie NUMERIC(4),
   categorie categ_produse DEFAULT 'replicas',
   materials VARCHAR [], --pot sa nu fie specificare deci nu punem NOT NULL
   age_restriction BOOLEAN NOT NULL DEFAULT FALSE,
   imagine VARCHAR(300),
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT into produse (nume,descriere,pret, driver, team, tip_produs, an_fabricatie, categorie, materials, age_restriction, imagine) VALUES 
('LEWIS HAMILTON 2022 OFFICIAL REPLICA RACE SUIT', 'LEWIS HAMILTON 2022 OFFICIAL REPLICA RACE SUIT', 2999 , 'Lewis Hamilton', 'Mercedes', 'clothing', 2022, 'racewear','{"cotton"}', False, 'LEWIS_HAMILTON_2022_OFFICIAL_REPLICA_RACE_SUIT.jpg'),

('SEBASTIAN VETTEL 2022 OFFICIAL RACE SPEC RACE SUIT', 'SEBASTIAN VETTEL 2022 OFFICIAL RACE SPEC RACE SUIT', 2999 , 'Sebastian Vettel', 'Aston Martin', 'clothing', 2022, 'racewear','{"cotton"}', False, 'SEBASTIAN_VETTEL_2022_OFFICIAL_RACE_SPEC_RACE_SUIT.jpg'),

('LEWIS HAMILTON MCLAREN 2012 OFFICIAL REPLICA RACE SUIT', 'LEWIS HAMILTON MCLAREN 2012 OFFICIAL REPLICA RACE SUIT', 2999 , 'Lewis Hamilton', 'McLaren', 'clothing', 2012, 'racewear','{"cotton"}', False, 'LEWIS_HAMILTON_MCLAREN_2012_OFFICIAL_REPLICA_RACE_SUIT.jpg'),

('DAVID COULTHARD 1997 OFFICIAL REPLICA MCLAREN RACE SUIT', 'DAVID COULTHARD 1997 OFFICIAL REPLICA MCLAREN RACE SUIT', 999 , 'David Coulthard', 'McLaren', 'clothing', 1997, 'racewear','{"cotton"}', False, 'DAVID_COULTHARD_1997_OFFICIAL_REPLICA_MCLAREN_RACE_SUIT.jpg'),

('SEBASTIAN VETTEL 2022 OFFICIAL RACE SPEC BALACLAVA', 'SEBASTIAN VETTEL 2022 OFFICIAL RACE SPEC BALACLAVA', 499 , 'Sebastian Vettel', 'Aston Martin', 'clothing', 2022, 'racewear','{"cotton"}', False, 'SEBASTIAN_VETTEL_2022_OFFICIAL_RACE_SPEC_BALACLAVA.jpg'),

('KIMI RÄIKKÖNEN 2006 OFFICIAL MCLAREN REPLICA RACE SUIT', 'KIMI RÄIKKÖNEN 2006 OFFICIAL MCLAREN REPLICA RACE SUIT', 1999 , 'Kimi Räikkönen', 'McLaren', 'clothing', 2006, 'racewear','{"cotton"}', False, 'KIMI_RÄIKKÖNEN_2006_OFFICIAL_MCLAREN_REPLICA_RACE_SUIT.jpg'),

('GUENTHER STEINER FOKSMASH HAAS F1 TEAM SIGNED T-SHIRT', 'GUENTHER STEINER FOKSMASH HAAS F1 TEAM SIGNED T-SHIRT', 79.99 , '', 'Haas', 'clothing', 2022, 'team merchandise','{"cotton"}', False, 'GUENTHER_STEINER_FOKSMASH_HAAS_F1_TEAM_SIGNED_T-SHIRT.jpg'),

('VALTTERI BOTTAS 2022 SIGNED POLO SHIRT', 'VALTTERI BOTTAS 2022 SIGNED POLO SHIRT', 149 , 'Valtteri Bottas', 'Alfa Romeo', 'clothing', 2022, 'team merchandise','{"cotton"}', False, 'VALTTERI_BOTTAS_2022_SIGNED_POLO_SHIRT.jpg'),

('FERNANDO ALONSO 2021 SIGNED SHIRT', 'FERNANDO ALONSO 2021 SIGNED SHIRT', 149 , 'Fernando Alonso', 'Alpine', 'clothing', 2021, 'team merchandise','{"cotton"}', False, 'FERNANDO_ALONSO_2021_SIGNED_SHIRT.jpg'),

('LANCE STROLL 2021 SIGNED POLO SHIRT', 'LANCE STROLL 2021 SIGNED POLO SHIRT', 99 , 'Lance Stroll', 'Aston Martin', 'clothing', 2021, 'team merchandise','{"cotton"}', False, 'LANCE_STROLL_2021_SIGNED_POLO_SHIRT.jpg'),

('MICK SCHUMACHER 2022 SIGNED CAP', 'MICK SCHUMACHER 2022 SIGNED CAP', 79 , 'Mick Schumacher', 'Haas', 'clothing', 2022, 'team merchandise','{"cotton"}', False, 'MICK_SCHUMACHER_2022_SIGNED_CAP.jpg'),

('NIGEL MANSELL & AYRTON SENNA TAXI GICLEE PRINT', 'NIGEL MANSELL & AYRTON SENNA TAXI GICLEE PRINT', 299 , 'Ayrton Senna', 'Ferrari', 'art', 2022, 'art','{}', False, 'NIGEL_MANSELL_AYRTON_SENNA_TAXI_GICLEE_PRINT.jpg'),

('SEBASTIAN VETTEL HELMET FRAMED PRINT', 'SEBASTIAN VETTEL HELMET FRAMED PRINT', 399 , 'Sebastian Vettel', 'Ferrari', 'art', 2022, 'art','{}', False, 'SEBASTIAN_VETTEL_HELMET_FRAMED_PRINT.jpg'),

('LEWIS HAMILTON 2018 WORLD CHAMPION', 'LEWIS HAMILTON 2018 WORLD CHAMPION', 284 , 'Lewis Hamilton', 'Mercedes', 'art', 2018, 'art','{}', False, 'LEWIS_HAMILTON_2018_WORLD_CHAMPION.jpg'),

('CARLOS SAINZ BRITISH GRAND PRIX 2022 ROLLED PRINT', 'CARLOS SAINZ BRITISH GRAND PRIX 2022 ROLLED PRINT', 284 , 'Carlos Sainz', 'Ferrari', 'art', 2022, 'art','{}', False, 'CARLOS_SAINZ_BRITISH_GRAND_PRIX_2022_ROLLED_PRINT.jpg'),

('MAX VERSTAPPEN 2021 DUTCH GP WIN ROLLED PRINT', 'MAX VERSTAPPEN 2021 DUTCH GP WIN ROLLED PRINT', 284 , 'Max Verstappen', 'Red Bull', 'art', 2021, 'art','{}', False, 'MAX_VERSTAPPEN_2021_DUTCH_GP_WIN_ROLLED_PRINT.jpg'),

('KIMI RÄIKKÖNEN', 'KIMI RÄIKKÖNEN', 284 , 'Kimi Räikkönen', 'Ferrari', 'art', 2007, 'art','{}', False, 'KIMI_RÄIKKÖNEN.jpg'),

('AYRTON SENNA 25TH ANNIVERSARY PORTRAIT', 'AYRTON SENNA 25TH ANNIVERSARY PORTRAIT', 284 , 'Ayrton Senna', 'Ferrari', 'art', 2022, 'art','{}', False, 'AYRTON_SENNA_25TH_ANNIVERSARY_PORTRAIT.jpg'),

('FERNANDO ALONSO 2016 RACE USED RACE SUIT', 'FERNANDO ALONSO 2016 RACE USED RACE SUIT', 1575 , 'Fernando Alonso', 'McLaren', 'clothing', 2016, 'limited edition','{"cotton"}', False, 'FERNANDO_ALONSO_2016_RACE_USED_RACE_SUIT.jpg'),

('FERNANDO ALONSO 2022 OFFICIAL REPLICA RACE BOOTS', 'FERNANDO ALONSO 2022 OFFICIAL REPLICA RACE BOOTS', 399 , 'Fernando Alonso', 'Alpine', 'clothing', 2022, 'limited edition','{}', False, 'FERNANDO_ALONSO_2022_OFFICIAL_REPLICA_RACE_BOOTS.jpg'),

('FERNANDO ALONSO 2017 OFFICIAL REPLICA HELMET', 'FERNANDO ALONSO 2017 OFFICIAL REPLICA HELMET', 1035 , 'Fernando Alonso', 'McLaren', 'clothing', 2017, 'limited edition','{}', False, 'FERNANDO_ALONSO_2017_OFFICIAL_REPLICA_HELMET.jpg'),

('FORMULA 1 2022 CONCEPT SCULPTURE', 'FORMULA 1 2022 CONCEPT SCULPTURE', 175 , '', '', 'mechanical', 2022, 'replicas','{}', True, 'FORMULA_1_2022_CONCEPT_SCULPTURE.jpg'),

('MAX VERSTAPPEN 2022 RB18 1:4 SCALE MODEL F1 CAR', 'MAX VERSTAPPEN 2022 RB18 1:4 SCALE MODEL F1 CAR', 28750 , 'Max Verstappen', 'Red Bull', 'mechanical', 2022, 'replicas','{}', True, 'MAX_VERSTAPPEN_2022_RB18_1-4_SCALE_MODEL_F1_CAR.jpg'),

('PIRELLI RED SOFT COMPOUND WIND TUNNEL TYRE', 'PIRELLI RED SOFT COMPOUND WIND TUNNEL TYRE', 1199 , '', '', 'mechanical', 2022, 'replicas','{}', False, 'PIRELLI_RED_SOFT_COMPOUND_WIND_TUNNEL_TYRE.jpg'),

('FERRARI F2008 2008 1:1 SCALE MODEL STEERING WHEEL', 'FERRARI F2008 2008 1:1 SCALE MODEL STEERING WHEEL', 4995 , '', 'Ferrari', 'mechanical', 2008, 'replicas','{}', False, 'FERRARI_F2008_SCALE_MODEL_STEERING_WHEEL.jpg'),

('CARLOS SAINZ 2021 1:18 SCALE MODEL CAR SF21', 'CARLOS SAINZ 2021 1:18 SCALE MODEL CAR SF21', 845 , 'Carlos Sainz', 'Ferrari', 'mechanical', 2008, 'replicas','{}', False, 'CARLOS_SAINZ_2021_SCALE_MODEL_CAR_SF21.jpg'),

('MCLAREN MP4/4 1988 JAPANESE GP 1:18 SCALE MODEL', 'MCLAREN MP4/4 1988 JAPANESE GP 1:18 SCALE MODEL', 795 , '', 'McLaren', 'mechanical', 1988, 'replicas','{}', False, 'MCLAREN_1988_JAPANESE_GP_SCALE_MODEL.jpg'),

('PIRELLI BLUE WET COMPOUND WIND TUNNEL TYRE', 'PIRELLI BLUE WET COMPOUND WIND TUNNEL TYRE', 1199 , '', '', 'mechanical', 2022, 'replicas','{}', False, 'PIRELLI_BLUE_WET_COMPOUND_WIND_TUNNEL_TYRE.jpg'),

('MCLAREN MCL35M NOSECONE 2021 1:12 SCALE MODEL', 'MCLAREN MCL35M NOSECONE 2021 1:12 SCALE MODEL', 299 , '', 'McLaren', 'mechanical', 2021, 'replicas','{}', False, 'MCLAREN_MCL35M_NOSECONE_2021_SCALE_MODEL.jpg'),

('LEWIS HAMILTON 2020 MERCEDES-AMG F1 W11 EQ PERFORMANCE 1:8 SCALE MODEL', 'LEWIS HAMILTON 2020 MERCEDES-AMG F1 W11 EQ PERFORMANCE 1:8 SCALE MODEL', 7495 , 'Lewis Hamilton', 'Mercedes', 'mechanical', 2020, 'replicas','{}', False, 'LEWIS_HAMILTON_2020_F1_W11_EQ_PERFORMANCE_SCALE_MODEL.jpg'),

('MICHAEL SCHUMACHER FERRARI 2002 F2002 1:8 SCALE MODEL F1 CAR', 'MICHAEL SCHUMACHER FERRARI 2002 F2002 1:8 SCALE MODEL F1 CAR', 7495 , 'Michael Schumacher', 'Ferrari', 'mechanical', 2002, 'replicas','{}', False, 'MICHAEL_SCHUMACHER_FERRARI_2002_F2002_SCALE_MODEL_CAR.jpg');

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ioan;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ioan;