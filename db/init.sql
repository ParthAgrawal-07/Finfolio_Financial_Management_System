-- FinFolio Database Init Script
-- This file is mounted into the PostgreSQL container and runs
-- automatically on first startup via docker-entrypoint-initdb.d/
-- Copy your full PROJECT_DDL.sql content here, then add INSERT statements.

-- ══════════════════════════════════════════════════════════════
-- NOTE: Replace the contents below with your PROJECT_DDL.sql
-- and your INSERT_Data_final.sql statements.
-- ══════════════════════════════════════════════════════════════

-- Example minimal schema (your full DDL goes here):
CREATE TABLE "User" (
    User_ID VARCHAR(50) PRIMARY KEY,
    First_name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    User_role VARCHAR(20) CHECK (User_role IN ('Client', 'Advisor'))
);

CREATE TABLE Company (
    Company_ID VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    street VARCHAR(100),
    city VARCHAR(50),
    zip VARCHAR(20)
);

CREATE TABLE Analyst (
    Analyst_ID VARCHAR(50) PRIMARY KEY,
    analyst_name VARCHAR(100) NOT NULL,
    firm_name VARCHAR(100) NOT NULL
);

CREATE TABLE Calendar_Date (
    Date DATE PRIMARY KEY
);

CREATE TABLE User_Email (
    User_ID VARCHAR(50),
    Email VARCHAR(100),
    PRIMARY KEY (User_ID, Email),
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);


CREATE TABLE Security (
    Security_ID VARCHAR(50) PRIMARY KEY,
    Company_ID VARCHAR(50),
    ticker_symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    security_type VARCHAR(20),
    sector VARCHAR(50),
    exchange VARCHAR(20),
    FOREIGN KEY (Company_ID) REFERENCES Company(Company_ID) ON DELETE SET NULL
);

CREATE TABLE Account (
    Account_ID VARCHAR(50) PRIMARY KEY,
    User_ID VARCHAR(50) NOT NULL,
    Account_type VARCHAR(20),
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_date DATE NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Portfolio (
    Portfolio_ID VARCHAR(50) PRIMARY KEY,
    User_ID VARCHAR(50) NOT NULL,
    portfolio_name VARCHAR(100) NOT NULL,
    creation_date DATE NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

-- Fixed_Deposit must be created before Transaction (FK dependency)
CREATE TABLE Fixed_Deposit (
    FD_ID VARCHAR(50) PRIMARY KEY,
    User_ID VARCHAR(50) NOT NULL,
    FD_Amount DECIMAL(15, 2) NOT NULL,
    Interest_rate DECIMAL(5, 2) NOT NULL,
    Start_date DATE NOT NULL,
    Maturity_date DATE NOT NULL,
    Status VARCHAR(20) NOT NULL,
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

-- BUG FIX: Quoted (reserved keyword), FD_ID nullable (some txns have no FD), added missing comma
CREATE TABLE "Transaction" (
    Transaction_ID VARCHAR(50) PRIMARY KEY,
    Account_ID VARCHAR(50) NOT NULL,
    FD_ID VARCHAR(50),
    txn_type VARCHAR(20) CHECK (txn_type IN ('Deposit', 'Withdrawal')),
    Amount DECIMAL(15, 2) NOT NULL,
    Timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (Account_ID) REFERENCES Account(Account_ID) ON DELETE CASCADE,
    FOREIGN KEY (FD_ID) REFERENCES Fixed_Deposit(FD_ID) ON DELETE SET NULL
);

CREATE TABLE Market_Price (
    Security_ID VARCHAR(50),
    trade_date DATE,
    open_price DECIMAL(15, 2),
    high_price DECIMAL(15, 2),
    low_price DECIMAL(15, 2),
    close_price DECIMAL(15, 2),
    volume BIGINT,
    PRIMARY KEY (Security_ID, trade_date),
    FOREIGN KEY (Security_ID) REFERENCES Security(Security_ID) ON DELETE CASCADE
);

CREATE TABLE Financial_Result (
    Company_ID VARCHAR(50),
    quarter_end_date DATE,
    revenue DECIMAL(18, 2),
    net_profit DECIMAL(18, 2),
    eps DECIMAL(10, 2),
    PRIMARY KEY (Company_ID, quarter_end_date),
    FOREIGN KEY (Company_ID) REFERENCES Company(Company_ID) ON DELETE CASCADE
);

CREATE TABLE Loan (
    Loan_ID VARCHAR(50) PRIMARY KEY,
    User_ID VARCHAR(50) NOT NULL,
    Principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    status VARCHAR(20),
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Trade_Order (
    Order_ID VARCHAR(50) PRIMARY KEY,
    Account_ID VARCHAR(50) NOT NULL,
    Security_ID VARCHAR(50) NOT NULL,
    Order_type VARCHAR(20),
    target_price DECIMAL(15, 2),
    status VARCHAR(20),
    FOREIGN KEY (Account_ID) REFERENCES Account(Account_ID) ON DELETE CASCADE,
    FOREIGN KEY (Security_ID) REFERENCES Security(Security_ID) ON DELETE CASCADE
);

CREATE TABLE Executed_Trade (
    Trade_ID VARCHAR(50) PRIMARY KEY,
    Order_ID VARCHAR(50) NOT NULL UNIQUE,
    executed_price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL,
    execution_timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (Order_ID) REFERENCES Trade_Order(Order_ID) ON DELETE CASCADE
);

CREATE TABLE Portfolio_Holding (
    Portfolio_ID VARCHAR(50),
    Security_ID VARCHAR(50),
    quantity_owned INT DEFAULT 0,
    average_buy_price DECIMAL(15, 2) DEFAULT 0.00,
    PRIMARY KEY (Portfolio_ID, Security_ID),
    FOREIGN KEY (Portfolio_ID) REFERENCES Portfolio(Portfolio_ID) ON DELETE CASCADE,
    FOREIGN KEY (Security_ID) REFERENCES Security(Security_ID) ON DELETE CASCADE
);

CREATE TABLE Publishes_Report (
    Analyst_ID VARCHAR(50),
    Security_ID VARCHAR(50),
    Date DATE,
    rating VARCHAR(20),
    target_price DECIMAL(15, 2),
    PRIMARY KEY (Analyst_ID, Security_ID, Date),
    FOREIGN KEY (Analyst_ID) REFERENCES Analyst(Analyst_ID) ON DELETE CASCADE,
    FOREIGN KEY (Security_ID) REFERENCES Security(Security_ID) ON DELETE CASCADE,
    FOREIGN KEY (Date) REFERENCES Calendar_Date(Date) ON DELETE CASCADE
);

CREATE TABLE Watchlist (
    User_ID VARCHAR(50),
    Security_ID VARCHAR(50),
    added_date DATE NOT NULL,
    PRIMARY KEY (User_ID, Security_ID),
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Security_ID) REFERENCES Security(Security_ID) ON DELETE CASCADE
);

CREATE TABLE Advises (
    assignment_ID VARCHAR(50) PRIMARY KEY,
    Advisor_ID VARCHAR(50) NOT NULL,
    Client_ID VARCHAR(50) NOT NULL,
    assignment_date DATE NOT NULL,
    FOREIGN KEY (Advisor_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Client_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    Review_ID VARCHAR(50) PRIMARY KEY,
    Client_ID VARCHAR(50) NOT NULL,
    Advisor_ID VARCHAR(50) NOT NULL,
    Rating INT CHECK (Rating >= 1 AND Rating <= 5),
    FOREIGN KEY (Client_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Advisor_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE User_Phone (
    User_ID VARCHAR(50),
    phone_number VARCHAR(20),
    PRIMARY KEY (User_ID, phone_number),
    FOREIGN KEY (User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Company_Sector (
    Company_ID VARCHAR(50),
    sector VARCHAR(50),
    PRIMARY KEY (Company_ID, sector),
    FOREIGN KEY (Company_ID) REFERENCES Company(Company_ID) ON DELETE CASCADE
);


-- ... (paste full DDL here) ...

-- Example seed data:
INSERT INTO "User" (User_ID, First_name, Last_Name, Password, User_role) VALUES
('U001', 'Rahul', 'Sharma', 'pass123', 'Client'),
('U002', 'Priya', 'Desai', 'pass123', 'Client'),
('U003', 'Vikram', 'Singh', 'pass123', 'Client'),
('U004', 'Neha', 'Gupta', 'pass123', 'Client'),
('U005', 'Rohan', 'Joshi', 'pass123', 'Client'),
('U006', 'Kavita', 'Menon', 'pass123', 'Client'),
('U007', 'Siddharth', 'Rao', 'pass123', 'Client'),
('U008', 'Ananya', 'Verma', 'pass123', 'Client'),
('U009', 'Aditya', 'Chopra', 'pass123', 'Client'),
('U010', 'Meera', 'Reddy', 'pass123', 'Client'),
('U011', 'Amit', 'Patel', 'admin01', 'Advisor'),
('U012', 'Sneha', 'Iyer', 'admin02', 'Advisor'),
('U013', 'Parth', 'Agrawal', 'admin03', 'Advisor'),
('U014', 'Harsh', 'Gohil', 'admin04', 'Advisor'),
('U015', 'Nisha', 'Kapoor', 'admin05', 'Advisor');

INSERT INTO User_Email (User_ID, Email) VALUES
('U001', 'rahul.s@email.com'),
('U001', 'rahul.business@corp.com'),
('U002', 'priya.d@email.com'),
('U003', 'vikram.s@email.com'),
('U004', 'neha.g@email.com'),
('U004', 'neha.personal@email.com'),
('U005', 'rohan.j@email.com'),
('U006', 'kavita.m@email.com'),
('U007', 'siddharth.r@email.com'),
('U008', 'ananya.v@email.com'),
('U009', 'aditya.c@email.com'),
('U010', 'meera.r@email.com'),
('U011', 'amit.advisor@finfolio.com'),
('U012', 'sneha.advisor@finfolio.com'),
('U013', 'parth.admin@finfolio.com'),
('U014', 'harsh.admin@finfolio.com'),
('U015', 'nisha.k@finfolio.com');

INSERT INTO User_Phone (User_ID, phone_number) VALUES
('U001', '+91-9876543210'),
('U002', '+91-9876543211'),
('U003', '+91-9876543212'),
('U003', '+91-9876543299'),
('U004', '+91-9876543213'),
('U005', '+91-9876543214'),
('U006', '+91-9876543215'),
('U007', '+91-9876543216'),
('U008', '+91-9876543217'),
('U009', '+91-9876543218'),
('U010', '+91-9876543222'),
('U011', '+91-9876543219'),
('U012', '+91-9876543220'),
('U013', '+91-9876543221'),
('U014', '+91-9876543223'),
('U015', '+91-9876543224');

INSERT INTO Company (Company_ID, company_name, street, city, zip) VALUES
('C001', 'Tata Consultancy Services', 'Banyan Park', 'Mumbai', '400060'),
('C002', 'Reliance Industries', 'Maker Chambers', 'Mumbai', '400021'),
('C003', 'HDFC Bank', 'Senapati Bapat Marg', 'Mumbai', '400013'),
('C004', 'Infosys Limited', 'Electronics City', 'Bengaluru', '560100'),
('C005', 'ITC Limited', 'Virginia House', 'Kolkata', '700071'),
('C006', 'Larsen & Toubro', 'L&T House', 'Mumbai', '400001'),
('C007', 'State Bank of India', 'Madame Cama Road', 'Mumbai', '400021'),
('C008', 'Bharti Airtel', 'Nelson Mandela Road', 'New Delhi', '110070'),
('C009', 'Wipro Limited', 'Doddakannelli', 'Bengaluru', '560035'),
('C010', 'Asian Paints', 'Santacruz East', 'Mumbai', '400055'),
('C011', 'Maruti Suzuki', 'Nelson Mandela Road', 'New Delhi', '110070'),
('C012', 'Sun Pharma', 'Goregaon East', 'Mumbai', '400063'),
('C013', 'Titan Company', 'Integrity Campus', 'Bengaluru', '560100'),
('C014', 'Bajaj Finance', 'Akurdi', 'Pune', '411035'),
('C015', 'Adani Ports', 'Navrangpura', 'Ahmedabad', '380009');

INSERT INTO Company_Sector (Company_ID, sector) VALUES
('C001', 'IT'),
('C002', 'Energy'),
('C002', 'Retail'),
('C003', 'Banking'),
('C004', 'IT'),
('C005', 'FMCG'),
('C006', 'Construction'),
('C007', 'Banking'),
('C008', 'Telecom'),
('C009', 'IT'),
('C010', 'Consumer Goods'),
('C011', 'Automotive'),
('C012', 'Pharmaceuticals'),
('C013', 'Consumer Goods'),
('C014', 'Financial Services'),
('C015', 'Infrastructure');

INSERT INTO Financial_Result (Company_ID, quarter_end_date, revenue, net_profit, eps) VALUES
('C001', '2026-03-31', 60000.50, 12000.75, 32.40),
('C002', '2026-03-31', 230000.00, 19000.00, 28.50),
('C003', '2026-03-31', 45000.00, 11000.25, 19.80),
('C004', '2026-03-31', 38000.00, 6500.50, 15.60),
('C005', '2026-03-31', 17000.25, 5000.00, 12.10),
('C006', '2026-03-31', 50000.00, 4000.50, 22.30),
('C007', '2026-03-31', 85000.00, 14000.00, 16.50),
('C008', '2026-03-31', 35000.50, 3000.25, 8.40),
('C009', '2026-03-31', 22000.00, 2800.00, 5.20),
('C010', '2026-03-31', 8500.75, 1200.50, 14.10),
('C011', '2026-03-31', 32000.00, 3100.00, 10.50),
('C012', '2026-03-31', 11500.00, 2200.00, 9.20),
('C013', '2026-03-31', 9500.00, 1050.00, 11.80),
('C014', '2026-03-31', 12500.00, 3400.00, 55.40),
('C015', '2026-03-31', 6500.00, 1800.00, 8.90);

INSERT INTO Analyst (Analyst_ID, analyst_name, firm_name) VALUES
('A001', 'Saurabh Mukherjea', 'Marcellus Investment'),
('A002', 'Rakesh Jhunjhunwala', 'Rare Enterprises'),
('A003', 'Ravi Dharamshi', 'ValueQuest Investment'),
('A004', 'Prashant Jain', 'HDFC AMC'),
('A005', 'Sunil Singhania', 'Abakkus Asset Manager'),
('A006', 'Navneet Munot', 'HDFC Mutual Fund'),
('A007', 'Nilesh Shah', 'Kotak AMC'),
('A008', 'Radhika Gupta', 'Edelweiss AMC'),
('A009', 'Anoop Bhaskar', 'IDFC AMC'),
('A010', 'Shankar Sharma', 'First Global'),
('A011', 'Rajeev Thakkar', 'PPFAS Mutual Fund'),
('A012', 'Sankaran Naren', 'ICICI Prudential'),
('A013', 'Neelesh Surana', 'Mirae Asset'),
('A014', 'Samir Arora', 'Helios Capital'),
('A015', 'Porinju Veliyath', 'Equity Intelligence');

INSERT INTO Calendar_Date (Date) VALUES 
('2026-04-01'), ('2026-04-02'), ('2026-04-03'), ('2026-04-06'), ('2026-04-07'),
('2026-04-08'), ('2026-04-09'), ('2026-04-10'), ('2026-04-13'), ('2026-04-14'),
('2026-04-15'), ('2026-04-16'), ('2026-04-17'), ('2026-04-20'), ('2026-04-21');

INSERT INTO Security (Security_ID, Company_ID, ticker_symbol, name, security_type, sector, exchange) VALUES
('SEC01', 'C001', 'TCS', 'TCS Equity', 'Stock', 'IT', 'NSE'),
('SEC02', 'C002', 'RELIANCE', 'Reliance Equity', 'Stock', 'Energy', 'NSE'),
('SEC03', 'C003', 'HDFCBANK', 'HDFC Bank Equity', 'Stock', 'Banking', 'NSE'),
('SEC04', 'C004', 'INFY', 'Infosys Equity', 'Stock', 'IT', 'BSE'),
('SEC05', 'C005', 'ITC', 'ITC Equity', 'Stock', 'FMCG', 'NSE'),
('SEC06', 'C006', 'LT', 'L&T Equity', 'Stock', 'Construction', 'BSE'),
('SEC07', 'C007', 'SBIN', 'SBI Equity', 'Stock', 'Banking', 'NSE'),
('SEC08', 'C008', 'BHARTIARTL', 'Airtel Equity', 'Stock', 'Telecom', 'NSE'),
('SEC09', 'C009', 'WIPRO', 'Wipro Equity', 'Stock', 'IT', 'BSE'),
('SEC10', 'C010', 'ASIANPAINT', 'Asian Paints Equity', 'Stock', 'Consumer Goods', 'NSE'),
('SEC11', 'C011', 'MARUTI', 'Maruti Suzuki Equity', 'Stock', 'Automotive', 'NSE'),
('SEC12', 'C012', 'SUNPHARMA', 'Sun Pharma Equity', 'Stock', 'Pharmaceuticals', 'NSE'),
('SEC13', 'C013', 'TITAN', 'Titan Equity', 'Stock', 'Consumer Goods', 'BSE'),
('SEC14', 'C014', 'BAJFINANCE', 'Bajaj Finance Equity', 'Stock', 'Financial Services', 'NSE'),
('SEC15', 'C015', 'ADANIPORTS', 'Adani Ports Equity', 'Stock', 'Infrastructure', 'NSE');

INSERT INTO Account (Account_ID, User_ID, Account_type, balance, created_date) VALUES
('ACC01', 'U001', 'Trading', 150000.00, '2025-01-10'),
('ACC02', 'U001', 'Savings', 500000.00, '2025-01-15'),
('ACC03', 'U002', 'Investment', 850000.00, '2024-06-22'),
('ACC04', 'U003', 'Trading', 75000.00, '2025-11-05'),
('ACC05', 'U004', 'Savings', 1200000.00, '2023-03-12'),
('ACC06', 'U004', 'Trading', 400000.00, '2023-04-01'),
('ACC07', 'U005', 'Investment', 95000.00, '2026-01-20'),
('ACC08', 'U006', 'Trading', 320000.00, '2025-08-18'),
('ACC09', 'U007', 'Trading', 60000.00, '2022-12-10'),
('ACC10', 'U008', 'Investment', 1500000.00, '2021-09-09'),
('ACC11', 'U009', 'Trading', 450000.00, '2025-05-05'),
('ACC12', 'U010', 'Savings', 800000.00, '2024-08-14'),
('ACC13', 'U002', 'Trading', 120000.00, '2026-02-11'),
('ACC14', 'U005', 'Trading', 300000.00, '2026-03-01'),
('ACC15', 'U007', 'Investment', 250000.00, '2024-11-20');

INSERT INTO Portfolio (Portfolio_ID, User_ID, portfolio_name, creation_date) VALUES
('PORT01', 'U001', 'Rahul Tech Holdings', '2025-01-12'),
('PORT02', 'U001', 'Rahul Bluechip', '2025-02-01'),
('PORT03', 'U002', 'Priya Long Term', '2024-06-25'),
('PORT04', 'U003', 'Vikram Swing Trades', '2025-11-10'),
('PORT05', 'U004', 'Neha Retirement', '2023-03-15'),
('PORT06', 'U005', 'Rohan High Risk', '2026-01-25'),
('PORT07', 'U006', 'Kavita Value Fund', '2025-08-20'),
('PORT08', 'U007', 'Siddharth Growth', '2023-01-10'),
('PORT09', 'U008', 'Ananya Secure Bonds', '2021-10-01'),
('PORT10', 'U009', 'Aditya Auto Sector', '2025-06-15'),
('PORT11', 'U010', 'Meera Pharma Focus', '2024-09-10'),
('PORT12', 'U002', 'Priya Div Yield', '2026-02-15'),
('PORT13', 'U004', 'Neha Trading', '2023-05-18'),
('PORT14', 'U006', 'Kavita Tech', '2025-10-22'),
('PORT15', 'U008', 'Ananya Aggressive', '2022-01-11');

INSERT INTO Fixed_Deposit (FD_ID, User_ID, FD_Amount, Interest_rate, Start_date, Maturity_date, Status) VALUES
('FD01', 'U001', 100000.00, 6.50, '2025-01-10', '2026-01-10', 'Matured'),
('FD02', 'U002', 250000.00, 7.00, '2026-02-15', '2028-02-15', 'Active'),
('FD03', 'U003', 50000.00, 5.50, '2024-06-01', '2025-06-01', 'Matured'),
('FD04', 'U004', 500000.00, 7.25, '2025-10-20', '2030-10-20', 'Active'),
('FD05', 'U005', 75000.00, 6.00, '2026-01-05', '2027-01-05', 'Active'),
('FD06', 'U006', 150000.00, 6.75, '2023-12-01', '2026-12-01', 'Active'),
('FD07', 'U007', 300000.00, 7.50, '2025-05-15', '2028-05-15', 'Active'),
('FD08', 'U008', 200000.00, 6.25, '2024-08-10', '2025-08-10', 'Matured'),
('FD09', 'U009', 1000000.00, 8.00, '2026-03-01', '2031-03-01', 'Active'),
('FD10', 'U010', 400000.00, 6.80, '2025-11-11', '2026-11-11', 'Active'),
('FD11', 'U011', 80000.00, 5.75, '2024-02-20', '2025-02-20', 'Matured'),
('FD12', 'U012', 600000.00, 7.10, '2025-09-05', '2027-09-05', 'Active'),
('FD13', 'U013', 120000.00, 6.00, '2026-04-01', '2027-04-01', 'Active'),
('FD14', 'U014', 95000.00, 6.40, '2025-07-22', '2028-07-22', 'Active'),
('FD15', 'U015', 350000.00, 7.00, '2026-02-18', '2029-02-18', 'Active');

INSERT INTO "Transaction" (Transaction_ID, Account_ID, FD_ID, txn_type, Amount, Timestamp) VALUES
('TXN01', 'ACC01', NULL, 'Deposit', 50000.00, '2026-04-01 09:15:00'),
('TXN02', 'ACC03', NULL, 'Deposit', 200000.00, '2026-04-03 11:00:00'),
('TXN03', 'ACC07', NULL, 'Deposit', 30000.00, '2026-04-09 10:05:00'),
('TXN04', 'ACC12', NULL, 'Withdrawal', 12000.00, '2026-04-14 10:20:00'),
('TXN05', 'ACC09', NULL, 'Deposit', 45000.00, '2026-04-12 09:30:00'),
('TXN06', 'ACC01', 'FD01', 'Withdrawal', 100000.00, '2025-01-10 10:00:00'), 
('TXN07', 'ACC03', 'FD02', 'Withdrawal', 250000.00, '2026-02-15 14:30:00'), 
('TXN08', 'ACC04', 'FD03', 'Withdrawal', 50000.00, '2024-06-01 09:50:00'),  
('TXN09', 'ACC05', 'FD04', 'Withdrawal', 500000.00, '2025-10-20 15:55:00'), 
('TXN10', 'ACC07', 'FD05', 'Withdrawal', 75000.00, '2026-01-05 12:00:00'),  
('TXN11', 'ACC08', 'FD06', 'Withdrawal', 150000.00, '2023-12-01 14:00:00'), 
('TXN12', 'ACC10', 'FD08', 'Withdrawal', 200000.00, '2024-08-10 09:30:00'),
('TXN13', 'ACC01', 'FD01', 'Deposit', 106500.00, '2026-01-10 10:00:00'),  
('TXN14', 'ACC04', 'FD03', 'Deposit', 52750.00, '2025-06-01 09:50:00'),   
('TXN15', 'ACC10', 'FD08', 'Deposit', 212500.00, '2025-08-10 09:30:00');  

INSERT INTO Market_Price (Security_ID, trade_date, open_price, high_price, low_price, close_price, volume) VALUES
('SEC01', '2026-04-01', 3900.00, 3950.50, 3880.00, 3925.00, 1500400),
('SEC02', '2026-04-01', 2850.00, 2890.00, 2830.00, 2875.50, 4500000),
('SEC03', '2026-04-01', 1450.00, 1465.00, 1440.00, 1460.00, 8500000),
('SEC04', '2026-04-01', 1600.00, 1620.00, 1590.00, 1610.50, 3200000),
('SEC05', '2026-04-01', 420.00, 430.00, 418.00, 428.50, 12000000),
('SEC06', '2026-04-01', 3400.00, 3450.00, 3380.00, 3420.00, 2100000),
('SEC07', '2026-04-01', 740.00, 755.00, 735.00, 750.00, 15000000),
('SEC08', '2026-04-01', 1050.00, 1080.00, 1045.00, 1075.00, 6000000),
('SEC09', '2026-04-01', 450.00, 460.00, 445.00, 455.00, 3100000),
('SEC10', '2026-04-01', 2800.00, 2850.00, 2780.00, 2820.00, 1800000),
('SEC11', '2026-04-01', 9800.00, 9950.00, 9750.00, 9900.00, 500000),
('SEC12', '2026-04-01', 1250.00, 1270.00, 1240.00, 1260.00, 4200000),
('SEC13', '2026-04-01', 3600.00, 3650.00, 3580.00, 3630.00, 1100000),
('SEC14', '2026-04-01', 7100.00, 7200.00, 7050.00, 7150.00, 800000),
('SEC15', '2026-04-01', 1150.00, 1180.00, 1140.00, 1170.00, 5500000);

INSERT INTO Loan (Loan_ID, User_ID, Principal_amount, interest_rate, status) VALUES
('L001', 'U001', 500000.00, 10.50, 'Active'),
('L002', 'U002', 1200000.00, 9.75, 'Active'),
('L003', 'U003', 300000.00, 11.00, 'Closed'),
('L004', 'U004', 2500000.00, 8.50, 'Active'),
('L005', 'U005', 150000.00, 12.00, 'Active'),
('L006', 'U006', 800000.00, 10.00, 'Defaulted'),
('L007', 'U007', 400000.00, 9.50, 'Active'),
('L008', 'U008', 650000.00, 11.25, 'Closed'),
('L009', 'U009', 1000000.00, 8.75, 'Active'),
('L010', 'U010', 250000.00, 10.25, 'Active'),
('L011', 'U001', 150000.00, 12.50, 'Active'),
('L012', 'U004', 50000.00, 13.00, 'Closed'),
('L013', 'U005', 900000.00, 9.00, 'Active'),
('L014', 'U008', 350000.00, 10.75, 'Active'),
('L015', 'U002', 750000.00, 9.50, 'Defaulted');

INSERT INTO Trade_Order (Order_ID, Account_ID, Security_ID, Order_type, target_price, status) VALUES
('ORD01', 'ACC01', 'SEC01', 'Market', 3925.00, 'Executed'),
('ORD02', 'ACC01', 'SEC02', 'Limit', 2800.00, 'Pending'),
('ORD03', 'ACC03', 'SEC03', 'Market', 1460.00, 'Executed'),
('ORD04', 'ACC04', 'SEC04', 'Limit', 1500.00, 'Pending'),
('ORD05', 'ACC06', 'SEC05', 'Market', 428.50, 'Executed'),
('ORD06', 'ACC08', 'SEC06', 'Limit', 3500.00, 'Pending'),
('ORD07', 'ACC09', 'SEC07', 'Market', 750.00, 'Executed'),
('ORD08', 'ACC10', 'SEC08', 'Limit', 1100.00, 'Pending'),
('ORD09', 'ACC11', 'SEC09', 'Market', 455.00, 'Executed'),
('ORD10', 'ACC13', 'SEC10', 'Limit', 2800.00, 'Pending'),
('ORD11', 'ACC14', 'SEC11', 'Market', 9900.00, 'Executed'),
('ORD12', 'ACC15', 'SEC12', 'Limit', 1200.00, 'Pending'),
('ORD13', 'ACC01', 'SEC13', 'Market', 3630.00, 'Executed'),
('ORD14', 'ACC03', 'SEC14', 'Limit', 7000.00, 'Pending'),
('ORD15', 'ACC04', 'SEC15', 'Market', 1170.00, 'Executed'),
('ORD16', 'ACC06', 'SEC01', 'Limit', 3800.00, 'Pending'),
('ORD17', 'ACC08', 'SEC02', 'Market', 2875.50, 'Executed');

INSERT INTO Executed_Trade (Trade_ID, Order_ID, executed_price, quantity, execution_timestamp) VALUES
('TRD01', 'ORD01', 3927.50, 10, '2026-04-01 10:15:22'),
('TRD02', 'ORD03', 1462.00, 100, '2026-04-01 11:30:45'),
('TRD03', 'ORD05', 429.00, 500, '2026-04-02 09:45:10'),
('TRD04', 'ORD07', 751.25, 50, '2026-04-02 13:20:05'),
('TRD05', 'ORD09', 456.00, 200, '2026-04-03 14:10:30'),
('TRD06', 'ORD11', 9915.00, 5, '2026-04-06 10:00:00'),
('TRD07', 'ORD13', 3635.00, 20, '2026-04-06 11:15:00'),
('TRD08', 'ORD15', 1172.50, 300, '2026-04-07 09:30:00'),
('TRD09', 'ORD17', 2878.00, 150, '2026-04-07 14:45:00');

INSERT INTO Portfolio_Holding (Portfolio_ID, Security_ID, quantity_owned, average_buy_price) VALUES
('PORT01', 'SEC01', 50, 3800.00),
('PORT01', 'SEC04', 100, 1550.00),
('PORT02', 'SEC02', 200, 2700.50),
('PORT03', 'SEC03', 500, 1400.00),
('PORT03', 'SEC05', 1000, 400.00),
('PORT04', 'SEC06', 40, 3450.00),
('PORT05', 'SEC07', 300, 720.50),
('PORT06', 'SEC08', 150, 1150.00),
('PORT07', 'SEC01', 40, 3900.00),
('PORT08', 'SEC04', 80, 1600.00),
('PORT09', 'SEC09', 500, 1000.00),
('PORT10', 'SEC11', 25, 9500.00),
('PORT11', 'SEC12', 400, 1200.00),
('PORT12', 'SEC13', 60, 3500.00),
('PORT13', 'SEC14', 15, 6800.00),
('PORT14', 'SEC15', 800, 1100.00),
('PORT15', 'SEC02', 120, 2600.00),
('PORT01', 'SEC10', 100, 2750.00);

INSERT INTO Publishes_Report (Analyst_ID, Security_ID, Date, rating, target_price) VALUES
('A001', 'SEC01', '2026-04-01', 'Buy', 4200.00),
('A002', 'SEC02', '2026-04-01', 'Hold', 2950.00),
('A003', 'SEC03', '2026-04-02', 'Buy', 1650.00),
('A004', 'SEC04', '2026-04-02', 'Sell', 1450.00),
('A005', 'SEC05', '2026-04-03', 'Buy', 500.00),
('A006', 'SEC06', '2026-04-03', 'Hold', 3600.00),
('A007', 'SEC07', '2026-04-06', 'Buy', 850.00),
('A008', 'SEC08', '2026-04-06', 'Hold', 1250.00),
('A009', 'SEC09', '2026-04-07', 'Sell', 420.00),
('A010', 'SEC10', '2026-04-07', 'Buy', 3200.00),
('A011', 'SEC11', '2026-04-08', 'Buy', 10500.00),
('A012', 'SEC12', '2026-04-08', 'Hold', 1300.00),
('A013', 'SEC13', '2026-04-09', 'Buy', 4000.00),
('A014', 'SEC14', '2026-04-09', 'Buy', 8000.00),
('A015', 'SEC15', '2026-04-10', 'Hold', 1200.00);

INSERT INTO Watchlist (User_ID, Security_ID, added_date) VALUES
('U001', 'SEC08', '2026-03-01'),
('U001', 'SEC09', '2026-03-15'),
('U002', 'SEC01', '2025-11-20'),
('U003', 'SEC02', '2026-01-10'),
('U004', 'SEC05', '2024-05-18'),
('U005', 'SEC06', '2026-02-28'),
('U006', 'SEC03', '2025-09-09'),
('U007', 'SEC10', '2026-03-25'),
('U008', 'SEC04', '2025-12-12'),
('U009', 'SEC11', '2026-04-01'),
('U010', 'SEC12', '2026-04-02'),
('U001', 'SEC13', '2026-04-05'),
('U002', 'SEC14', '2026-04-06'),
('U003', 'SEC15', '2026-04-07'),
('U004', 'SEC07', '2026-04-08'),
('U005', 'SEC01', '2026-04-09');

INSERT INTO Advises (assignment_ID, Advisor_ID, Client_ID, assignment_date) VALUES
('ASG01', 'U011', 'U001', '2025-01-05'),
('ASG02', 'U011', 'U002', '2024-06-15'),
('ASG03', 'U011', 'U003', '2025-10-20'),
('ASG04', 'U012', 'U004', '2023-03-01'),
('ASG05', 'U012', 'U005', '2026-01-10'),
('ASG06', 'U013', 'U006', '2025-08-05'),
('ASG07', 'U013', 'U007', '2025-12-01'), 
('ASG08', 'U014', 'U008', '2026-02-15'),
('ASG09', 'U014', 'U009', '2026-04-01'),
('ASG10', 'U015', 'U010', '2026-03-15'),
('ASG11', 'U011', 'U004', '2026-01-20'),
('ASG12', 'U012', 'U001', '2025-11-11'),
('ASG13', 'U013', 'U008', '2024-05-22'),
('ASG14', 'U014', 'U002', '2025-09-30'),
('ASG15', 'U015', 'U005', '2026-02-28');

INSERT INTO Reviews (Review_ID, Client_ID, Advisor_ID, Rating) VALUES
('REV01', 'U001', 'U011', 5),
('REV02', 'U002', 'U011', 4),
('REV03', 'U003', 'U011', 5),
('REV04', 'U004', 'U012', 3),
('REV05', 'U005', 'U012', 4),
('REV06', 'U006', 'U013', 5),
('REV07', 'U007', 'U013', 4),
('REV08', 'U008', 'U014', 5),
('REV09', 'U009', 'U014', 4),
('REV10', 'U010', 'U015', 3),
('REV11', 'U004', 'U011', 5),
('REV12', 'U001', 'U012', 4),
('REV13', 'U008', 'U013', 2),
('REV14', 'U002', 'U014', 5),
('REV15', 'U005', 'U015', 4);




