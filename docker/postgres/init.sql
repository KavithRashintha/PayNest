-- Initialize schemas for PayNest microservices
CREATE SCHEMA IF NOT EXISTS user_schema;
CREATE SCHEMA IF NOT EXISTS finance_schema;

-- Initial table DDL for user_schema.users
CREATE TABLE IF NOT EXISTS user_schema.users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table in finance_schema
CREATE TABLE IF NOT EXISTS finance_schema.accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(19, 4) NOT NULL DEFAULT 0.0000,
    currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table in finance_schema
CREATE TABLE IF NOT EXISTS finance_schema.categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT, -- NULL for system default categories
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
    icon VARCHAR(50),
    color VARCHAR(20),
    is_system_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table in finance_schema
CREATE TABLE IF NOT EXISTS finance_schema.transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_id BIGINT NOT NULL REFERENCES finance_schema.accounts(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES finance_schema.categories(id) ON DELETE SET NULL,
    to_account_id BIGINT REFERENCES finance_schema.accounts(id) ON DELETE SET NULL,
    amount DECIMAL(19, 4) NOT NULL,
    type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE, TRANSFER
    title VARCHAR(255) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table in finance_schema
CREATE TABLE IF NOT EXISTS finance_schema.budgets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES finance_schema.categories(id) ON DELETE CASCADE,
    amount_limit DECIMAL(19, 4) NOT NULL,
    period VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed System Default Categories
INSERT INTO finance_schema.categories (user_id, name, type, icon, color, is_system_default)
VALUES 
    (NULL, 'Salary', 'INCOME', 'wallet', '#2ECC71', TRUE),
    (NULL, 'Freelance', 'INCOME', 'laptop', '#3498DB', TRUE),
    (NULL, 'Investment Return', 'INCOME', 'trending-up', '#9B59B6', TRUE),
    (NULL, 'Other Income', 'INCOME', 'plus-circle', '#1ABC9C', TRUE),
    (NULL, 'Food & Dining', 'EXPENSE', 'utensils', '#E74C3C', TRUE),
    (NULL, 'Shopping', 'EXPENSE', 'shopping-bag', '#F39C12', TRUE),
    (NULL, 'Housing & Rent', 'EXPENSE', 'home', '#D35400', TRUE),
    (NULL, 'Transportation', 'EXPENSE', 'car', '#E67E22', TRUE),
    (NULL, 'Bills & Utilities', 'EXPENSE', 'receipt', '#C0392B', TRUE),
    (NULL, 'Entertainment', 'EXPENSE', 'film', '#8E44AD', TRUE),
    (NULL, 'Health & Fitness', 'EXPENSE', 'activity', '#16A085', TRUE),
    (NULL, 'Other Expense', 'EXPENSE', 'minus-circle', '#7F8C8D', TRUE)
ON CONFLICT DO NOTHING;
