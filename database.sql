CREATE TABLE users(
    id_user SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    patronimyc VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE roles(
    id_role SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE accounts(
    id_account SERIAL PRIMARY KEY,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (role_id) REFERENCES roles(id_role) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id_user) ON DELETE CASCADE
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
    inning_accyr_train REAL  DEFAULT 0,
    stat_block_train REAL  DEFAULT 0,
    sum_scores_train REAL DEFAULT 0,
    inning_sum INTEGER DEFAULT 0,
    blocks_sum INTEGER DEFAULT 0,
    attacks_sum INTEGER DEFAULT 0,
    catch_sum INTEGER DEFAULT 0,
    defence_sum INTEGER DEFAULT 0,
    support_sum INTEGER DEFAULT 0,
    account_id INTEGER,
    FOREIGN KEY (account_id) REFERENCES accounts(id_account) ON DELETE CASCADE
    );

CREATE TABLE action_types(
    id_action_type SERIAL PRIMARY KEY,
    name_type VARCHAR(255) NOT NULL,
    act_or_form VARCHAR(255) NOT NULL,
    result VARCHAR(255) NOT NULL,
    condition VARCHAR(255),
    description TEXT
    );

CREATE TABLE actions(
    id_action SERIAL PRIMARY KEY,
    name_action VARCHAR(255) NOT NULL,
    time TIME NOT NULL DEFAULT current_time,
    condition VARCHAR(255) NOT NULL,
    result VARCHAR(255) NOT NULL,
    score REAL NOT NULL,
    train_id INTEGER,
    FOREIGN KEY (train_id) REFERENCES trainings(id_train) ON DELETE CASCADE,
    action_type_id INTEGER,
    FOREIGN KEY (action_type_id) REFERENCES action_types(id_action_type) ON DELETE CASCADE
    );