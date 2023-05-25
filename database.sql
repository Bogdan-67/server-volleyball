CREATE TABLE users(
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    patronimyc VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    team VARCHAR(100)
);

CREATE TABLE roles(
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL
);

CREATE TABLE accounts(
    id_account SERIAL PRIMARY KEY,
    login VARCHAR(255) NOT NULL,   
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (role_id) REFERENCES roles(id_role) ON DELETE CASCADE,
    id_user INTEGER NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
    );

CREATE TABLE tokens(
    account_id SERIAL PRIMARY KEY,
    FOREIGN KEY (account_id) REFERENCES accounts(id_account) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL
);

CREATE TABLE stats(
    id_stat SERIAL PRIMARY KEY,
    inninig_accyr REAL,
    stat_block REAL,
    account_id INTEGER,
    FOREIGN KEY (account_id) REFERENCES accounts(id_account) ON DELETE CASCADE
    );

CREATE TABLE trainings(
    id_train SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    inning_stat REAL DEFAULT 0,
    blocks_stat REAL DEFAULT 0,
    attacks_stat REAL DEFAULT 0,
    catch_stat REAL DEFAULT 0,
    defence_stat REAL DEFAULT 0,
    support_stat REAL DEFAULT 0,
    day_team VARCHAR(255) NOT NULL,
    account_id INTEGER,
    FOREIGN KEY (account_id) REFERENCES accounts(id_account) ON DELETE CASCADE
    );

CREATE TABLE action_types(
    id_action_type SERIAL PRIMARY KEY,
    name_type VARCHAR(255) NOT NULL,
    result VARCHAR(255) NOT NULL,
    win_condition VARCHAR(255),
    loss_condition VARCHAR(255),
    description TEXT
    );

CREATE TABLE actions(
    id_action SERIAL PRIMARY KEY,
    name_action VARCHAR(255) NOT NULL,
    time TIME NOT NULL DEFAULT current_time,
    result VARCHAR(255) NOT NULL,
    condition VARCHAR(255),
    score INTEGER,
    day_team VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    id_train INTEGER,
    FOREIGN KEY (id_train) REFERENCES trainings(id_train) ON DELETE CASCADE,
    id_action_type INTEGER,
    FOREIGN KEY (id_action_type) REFERENCES action_types(id_action_type) ON DELETE CASCADE,
    account_id INTEGER,
    FOREIGN KEY (account_id) REFERENCES accounts(id_account) ON DELETE CASCADE
    );