-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
  specialty_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  therapist_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  years_experience INT DEFAULT 0,
  gender VARCHAR(20),
  fees_min DECIMAL(10,2),
  fees_max DECIMAL(10,2),
  languages VARCHAR(200),
  rating DECIMAL(3,2),
  image VARCHAR(500),
  bio TEXT
);

-- Create therapist_specialties table
CREATE TABLE IF NOT EXISTS therapist_specialties (
  therapist_id INT,
  specialty_id INT,
  PRIMARY KEY (therapist_id, specialty_id),
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id),
  FOREIGN KEY (specialty_id) REFERENCES specialties(specialty_id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  appointment_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  therapist_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'paid') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id)
);

-- Insert default specialties
INSERT INTO specialties (specialty_id, name) VALUES
  (1, 'Psychiatrist'),
  (2, 'Psychologist')
ON DUPLICATE KEY UPDATE name = VALUES(name);