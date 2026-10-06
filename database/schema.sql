-- CyberNex Security Operations Platform Database Schema
-- Intentionally Designed for Web Application Security Training

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS internal_notes;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    bio TEXT DEFAULT 'SecOps team member',
    avatar TEXT DEFAULT 'default.png',
    credits INTEGER DEFAULT 250,
    api_key TEXT,
    phone TEXT DEFAULT '+1-555-0199',
    department TEXT DEFAULT 'Security Operations',
    reset_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium',
    description TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    author_username TEXT NOT NULL,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id)
);

CREATE TABLE system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event TEXT NOT NULL,
    level TEXT NOT NULL,
    source_ip TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reset_token TEXT NOT NULL,
    security_question TEXT NOT NULL,
    security_answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE internal_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    note_content TEXT NOT NULL,
    is_confidential INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Seed Initial Users (Educational Lab Fake Data)
INSERT INTO users (id, username, password, email, full_name, role, bio, avatar, credits, api_key, phone, department, reset_token) VALUES
(1, 'admin', 'AdminPassword2026!', 'admin@cybernex.local', 'Alexander Vance (CISO)', 'admin', 'Global Head of Cyber Security & Threat Intelligence. Master clearance tier 1.', 'avatar_admin.png', 5000, 'CN-SECRET-9981-ADMIN-SUPERKEY', '+1-555-0100', 'Executive SecOps', 'ADM-RESET-7721'),
(2, 'alice', 'alice_hunter2', 'alice@cybernex.local', 'Alice Chen', 'analyst', 'Senior SOC Analyst specializing in malware reverse engineering and network forensics.', 'avatar_alice.png', 1200, 'CN-KEY-4412-ALICE-SEC', '+1-555-0142', 'Tier 2 SOC', 'ALC-RESET-9912'),
(3, 'bob', 'bobpassword123', 'bob@cybernex.local', 'Bob Miller', 'user', 'Junior Security Operator & IT Support Specialist. Currently undergoing defensive training.', 'avatar_bob.png', 350, 'CN-KEY-1109-BOB-DEV', '+1-555-0188', 'Tier 1 Triage', 'BOB-RESET-1234');

-- Seed Initial Security Incidents
INSERT INTO incidents (id, title, category, severity, description, author_id, author_username, status) VALUES
(1, 'Suspicious SSH Brute-force on Perimeter Gateway', 'Network Intrusion', 'High', 'Observed 1,420 failed auth attempts from external node 198.51.100.44 targeting bastion host.', 1, 'admin', 'Investigating'),
(2, 'Anomalous Outbound DNS Tunneling Activity', 'Exfiltration', 'Critical', 'High volume of TXT queries observed on subdomains of suspicious-c2.net. Quarantine initiated.', 2, 'alice', 'Open'),
(3, 'Workstation Endpoint AV Signature Drift', 'Endpoint Defense', 'Low', 'Asset CYBER-WS-092 report outdated ClamAV signatures. Automated patch dispatched.', 3, 'bob', 'Resolved'),
(4, 'Privileged Access Elevation Review Q3', 'Compliance', 'Medium', 'Quarterly IAM audit of PAM vault credentials. Two orphaned service tokens identified.', 2, 'alice', 'Open');

-- Seed System Logs
INSERT INTO system_logs (event, level, source_ip, details) VALUES
('Firewall Rule Reload Completed', 'INFO', '127.0.0.1', 'Applied ruleset hash #89a1bf'),
('Failed Authentication Attempt (User: root)', 'WARN', '192.168.1.15', 'Invalid username root from corporate subnet'),
('Kernel Integrity Guard Triggered', 'CRITICAL', '10.0.0.8', 'Memory signature mismatch detected in module ksecdd'),
('Backup Archive Rotation Executed', 'INFO', '127.0.0.1', 'Archive saved to /backup/cybernex_backup.sql');

-- Seed Password Reset Records
INSERT INTO password_resets (user_id, reset_token, security_question, security_answer) VALUES
(1, 'ADM-RESET-7721', 'What was your first pet name?', 'shadow'),
(2, 'ALC-RESET-9912', 'What city were you born in?', 'austin'),
(3, 'BOB-RESET-1234', 'What is your favorite color?', 'blue');

-- Seed Internal Notes
INSERT INTO internal_notes (user_id, note_content, is_confidential) VALUES
(1, 'CONFIDENTIAL: Internal API master secret is located at environment variable CYBERNEX_FLAG_MASTER. Server backup snapshot available at /download?file=cybernex_backup.sql', 1),
(2, 'Note to self: Review Bob access permissions. Bob should not have access to /admin/system-logs.', 0),
(3, 'Remember to change default password on printer interface at 192.168.1.200.', 0);
