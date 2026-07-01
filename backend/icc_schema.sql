-- ============================================================
--  ICC — India Care Consultancy
--  MySQL Schema  |  Database: icc
-- ============================================================

USE icc;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(120)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('super_admin','consultant','doctor','hospital') NOT NULL DEFAULT 'consultant',
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT           NOT NULL UNIQUE,
  name                 VARCHAR(120)  NOT NULL,
  email                VARCHAR(120)  NOT NULL UNIQUE,
  phone                VARCHAR(20)   NOT NULL,
  gender               ENUM('Male','Female','Other') NOT NULL,
  photo                VARCHAR(255)  DEFAULT '/doctors/default-doctor.jpg',
  registration_no      VARCHAR(60)   NOT NULL,
  qualification        VARCHAR(200)  NOT NULL,
  speciality           VARCHAR(100)  NOT NULL,
  experience_years     SMALLINT      NOT NULL DEFAULT 0,
  hospital_name        VARCHAR(150),
  clinic_address       TEXT          NOT NULL,
  city                 VARCHAR(80)   NOT NULL,
  area                 VARCHAR(80),
  consultation_fee     DECIMAL(10,2) NOT NULL,
  consultation_type    ENUM('Online','Offline','Both') NOT NULL DEFAULT 'Both',
  opd_timings          VARCHAR(60),
  bio                  TEXT,
  rating               DECIMAL(3,1)  DEFAULT 4.5,
  is_approved          TINYINT(1)    DEFAULT 0,
  is_subscribed        TINYINT(1)    DEFAULT 0,
  subscription_paid_at DATETIME      NULL,
  subscription_ends_at DATETIME      NULL,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_speciality (speciality),
  INDEX idx_city (city),
  INDEX idx_is_approved (is_approved)
);

CREATE TABLE IF NOT EXISTS doctor_availability (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  day       ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  UNIQUE KEY uq_doc_day (doctor_id, day)
);

CREATE TABLE IF NOT EXISTS doctor_languages (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  language  VARCHAR(60) NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_services (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  service   VARCHAR(120) NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_awards (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  award     VARCHAR(255) NOT NULL,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 3. HOSPITALS
CREATE TABLE IF NOT EXISTS hospitals (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT           NOT NULL UNIQUE,
  name                 VARCHAR(150)  NOT NULL,
  email                VARCHAR(120)  NOT NULL UNIQUE,
  phone                VARCHAR(20)   NOT NULL,
  emergency_contact    VARCHAR(20),
  website              VARCHAR(200),
  image                VARCHAR(255)  DEFAULT '/hospitals/default-hospital.jpg',
  registration_no      VARCHAR(80)   NOT NULL,
  hospital_type        ENUM('Multispeciality','General','Specialty','Clinic','Nursing Home','Diagnostic Centre') NOT NULL DEFAULT 'Multispeciality',
  total_beds           SMALLINT,
  address              TEXT          NOT NULL,
  city                 VARCHAR(80)   NOT NULL,
  opd_timings          VARCHAR(60)   DEFAULT '9:00 AM - 6:00 PM',
  about                TEXT,
  rating               DECIMAL(3,1)  DEFAULT 4.5,
  is_approved          TINYINT(1)    DEFAULT 0,
  is_subscribed        TINYINT(1)    DEFAULT 0,
  subscription_paid_at DATETIME      NULL,
  subscription_ends_at DATETIME      NULL,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_city (city),
  INDEX idx_is_approved (is_approved)
);

CREATE TABLE IF NOT EXISTS hospital_opd_days (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  day         ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun') NOT NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  UNIQUE KEY uq_hosp_day (hospital_id, day)
);

CREATE TABLE IF NOT EXISTS hospital_departments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  department  VARCHAR(100) NOT NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hospital_facilities (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id INT NOT NULL,
  facility    VARCHAR(100) NOT NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hospital_accreditations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  hospital_id   INT NOT NULL,
  accreditation VARCHAR(100) NOT NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hospital_doctors (
  hospital_id INT NOT NULL,
  doctor_id   INT NOT NULL,
  PRIMARY KEY (hospital_id, doctor_id),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)   REFERENCES doctors(id)   ON DELETE CASCADE
);

-- 4. APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  patient_name     VARCHAR(120)  NOT NULL,
  patient_phone    VARCHAR(20)   NOT NULL,
  patient_email    VARCHAR(120),
  doctor_id        INT           NULL,
  hospital_id      INT           NULL,
  appointment_date DATE          NOT NULL,
  time_slot        VARCHAR(30)   NOT NULL,
  concern          TEXT,
  status           ENUM('Pending','Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id)   REFERENCES doctors(id)   ON DELETE SET NULL,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_doctor (doctor_id),
  INDEX idx_hospital (hospital_id)
);

-- 5. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  patient_name            VARCHAR(120)  NOT NULL,
  patient_age             TINYINT UNSIGNED NOT NULL,
  patient_gender          ENUM('Male','Female','Other') NOT NULL,
  patient_phone           VARCHAR(20)   NOT NULL,
  patient_whatsapp        VARCHAR(20)   NOT NULL,
  patient_email           VARCHAR(120)  NOT NULL,
  patient_city            VARCHAR(80)   NOT NULL,
  patient_area            VARCHAR(80)   NOT NULL,
  main_problem            TEXT          NOT NULL,
  symptoms                TEXT          NOT NULL,
  duration                VARCHAR(60)   NOT NULL,
  preferred_speciality    VARCHAR(100)  NOT NULL,
  preferred_location      VARCHAR(80)   NOT NULL,
  budget_range            VARCHAR(60)   NOT NULL,
  preferred_doctor_gender ENUM('Male','Female','Any') DEFAULT 'Any',
  preferred_hospital      VARCHAR(150),
  preferred_datetime      VARCHAR(60)   NOT NULL,
  status                  ENUM('New','Contacted','Need More Details','Doctor Suggested','Appointment Pending','Converted','Lost') NOT NULL DEFAULT 'New',
  assigned_consultant_id  INT           NULL,
  patient_disclaimer      TINYINT(1)    NOT NULL DEFAULT 0,
  data_consent            TINYINT(1)    NOT NULL DEFAULT 0,
  priority                ENUM('High','Medium','Low') NOT NULL DEFAULT 'Medium',
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_consultant_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

CREATE TABLE IF NOT EXISTS lead_notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  lead_id    INT  NOT NULL,
  note       TEXT NOT NULL,
  author_id  INT  NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id)   REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_recommended_doctors (
  lead_id   INT NOT NULL,
  doctor_id INT NOT NULL,
  PRIMARY KEY (lead_id, doctor_id),
  FOREIGN KEY (lead_id)   REFERENCES leads(id)   ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_recommended_hospitals (
  lead_id     INT NOT NULL,
  hospital_id INT NOT NULL,
  PRIMARY KEY (lead_id, hospital_id),
  FOREIGN KEY (lead_id)     REFERENCES leads(id)     ON DELETE CASCADE,
  FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

-- 6. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  plan_key      VARCHAR(40)   NOT NULL UNIQUE,
  label         VARCHAR(80)   NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  duration_days SMALLINT      NOT NULL DEFAULT 30,
  description   TEXT,
  updated_by    INT NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO subscription_plans (plan_key, label, amount, duration_days, description) VALUES
  ('doctor',               'Doctor Monthly Plan',       300.00, 30, 'Monthly subscription for doctors'),
  ('hospital',             'Hospital Monthly Plan',     500.00, 30, 'Monthly subscription for hospitals'),
  ('patient_consultation', 'Patient Consultation Fee',  199.00,  1, 'Per consultation fee from patients');

-- 7. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL,
  payment_type    ENUM('subscription','spotlight','consultation','refund') NOT NULL,
  entity_type     ENUM('doctor','hospital','patient') NOT NULL,
  entity_id       INT           NULL,
  amount          DECIMAL(10,2) NOT NULL,
  currency        CHAR(3)       NOT NULL DEFAULT 'INR',
  status          ENUM('Pending','Paid','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  payment_method  ENUM('UPI','Card','Net Banking','Cash') NULL,
  transaction_ref VARCHAR(120)  NULL,
  invoice_no      VARCHAR(40)   NULL UNIQUE,
  paid_at         DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_type (payment_type),
  INDEX idx_entity (entity_type, entity_id)
);

-- 8. SPOTLIGHTS
CREATE TABLE IF NOT EXISTS spotlights (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  entity_type  ENUM('doctor','hospital') NOT NULL,
  entity_id    INT           NOT NULL,
  tagline      VARCHAR(160)  NOT NULL,
  payment_id   INT           NULL,
  fee_charged  DECIMAL(10,2) NOT NULL,
  starts_at    DATETIME      NOT NULL,
  ends_at      DATETIME      NOT NULL,
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_active (is_active),
  INDEX idx_ends (ends_at)
);

CREATE TABLE IF NOT EXISTS spotlight_fees (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  entity_type   ENUM('doctor','hospital') NOT NULL UNIQUE,
  amount        DECIMAL(10,2) NOT NULL,
  duration_days SMALLINT      NOT NULL DEFAULT 30,
  updated_by    INT NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO spotlight_fees (entity_type, amount, duration_days) VALUES
  ('doctor',   999.00,  30),
  ('hospital', 1499.00, 30);

-- 9. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(30)   NOT NULL UNIQUE,
  discount     DECIMAL(10,2) NOT NULL,
  type         ENUM('Percentage','Flat') NOT NULL DEFAULT 'Percentage',
  target       ENUM('Patients','Doctors','Hospitals','All') NOT NULL DEFAULT 'All',
  max_uses     INT           NOT NULL DEFAULT 100,
  used_count   INT           NOT NULL DEFAULT 0,
  expiry_date  DATE          NOT NULL,
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_by   INT           NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
);

-- 10. COMPLAINTS
CREATE TABLE IF NOT EXISTS complaints (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  from_type    ENUM('Patient','Doctor','Hospital') NOT NULL,
  from_name    VARCHAR(120)  NOT NULL,
  from_user_id INT           NULL,
  subject      VARCHAR(255)  NOT NULL,
  detail       TEXT          NOT NULL,
  against      VARCHAR(150)  NOT NULL,
  priority     ENUM('High','Medium','Low') NOT NULL DEFAULT 'Medium',
  status       ENUM('Open','In Review','Resolved','Closed') NOT NULL DEFAULT 'Open',
  assigned_to  INT           NULL,
  resolved_at  DATETIME      NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to)  REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)  NOT NULL,
  message     TEXT          NOT NULL,
  target      ENUM('All','Patients','Doctors','Hospitals') NOT NULL DEFAULT 'All',
  status      ENUM('Draft','Sent','Failed') NOT NULL DEFAULT 'Draft',
  reach_count INT           NOT NULL DEFAULT 0,
  sent_by     INT           NULL,
  sent_at     DATETIME      NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_target (target),
  INDEX idx_status (status)
);

-- 12. SPECIALITIES
CREATE TABLE IF NOT EXISTS specialities (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL UNIQUE,
  icon         VARCHAR(10)   DEFAULT '🏥',
  doctor_count INT           NOT NULL DEFAULT 0,
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO specialities (name, icon, is_active) VALUES
  ('Cardiology','❤️',1),('Neurology','🧠',1),('Orthopedics','🦴',1),
  ('Pediatrics','👶',1),('Dermatology','🩺',1),('Gynecology','🌸',1),
  ('Ophthalmology','👁️',1),('ENT','👂',1),('Oncology','🎗️',1),
  ('Urology','🏥',1),('Gastroenterology','🫁',1),('Psychiatry','🧬',1),
  ('General Surgery','⚕️',1),('Nephrology','🏥',1),('Endocrinology','💊',1);

-- 13. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(120) NOT NULL UNIQUE,
  role_label  VARCHAR(60)  NOT NULL DEFAULT 'Consultant',
  department  VARCHAR(80),
  phone       VARCHAR(20),
  status      ENUM('Active','Inactive','Invited') NOT NULL DEFAULT 'Invited',
  joined_at   DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. FOLLOW-UPS
CREATE TABLE IF NOT EXISTS follow_ups (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  lead_id        INT          NULL,
  patient_name   VARCHAR(120) NOT NULL,
  patient_phone  VARCHAR(20)  NOT NULL,
  concern        VARCHAR(255),
  city           VARCHAR(80),
  priority       ENUM('High','Medium','Low') NOT NULL DEFAULT 'Medium',
  status         ENUM('Not Called','Called','Interested','Appointment Fixed','Not Interested') NOT NULL DEFAULT 'Not Called',
  assigned_to    INT          NULL,
  notes          TEXT,
  next_follow_up DATETIME     NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id)     REFERENCES leads(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status)
);

-- 15. PROFILE CHANGE REQUESTS
CREATE TABLE IF NOT EXISTS profile_change_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('doctor','hospital') NOT NULL,
  entity_id   INT          NOT NULL,
  field_name  VARCHAR(80)  NOT NULL,
  old_value   TEXT,
  new_value   TEXT         NOT NULL,
  status      ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  reviewed_by INT          NULL,
  reviewed_at DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_entity (entity_type, entity_id)
);

-- 16. VERIFICATION DOCUMENTS
CREATE TABLE IF NOT EXISTS verification_documents (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('doctor','hospital') NOT NULL,
  entity_id   INT          NOT NULL,
  doc_type    VARCHAR(80)  NOT NULL,
  file_url    VARCHAR(255) NOT NULL,
  expiry_date DATE         NULL,
  is_verified TINYINT(1)   NOT NULL DEFAULT 0,
  verified_by INT          NULL,
  verified_at DATETIME     NULL,
  uploaded_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_expiry (expiry_date)
);

-- 17. FEEDBACK
CREATE TABLE IF NOT EXISTS feedback (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  from_name   VARCHAR(120) NOT NULL,
  from_email  VARCHAR(120),
  entity_type ENUM('doctor','hospital','platform') NOT NULL DEFAULT 'platform',
  entity_id   INT          NULL,
  rating      TINYINT      NOT NULL DEFAULT 5,
  comment     TEXT,
  is_approved TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_approved (is_approved)
);

-- 18. PASSWORD RESET OTPs
CREATE TABLE IF NOT EXISTS password_resets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  email      VARCHAR(120) NOT NULL,
  otp        CHAR(6)      NOT NULL,
  expires_at DATETIME     NOT NULL,
  is_used    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_email_otp (email, otp)
);

-- 19. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NULL,
  action      VARCHAR(80)  NOT NULL,
  entity_type VARCHAR(40)  NULL,
  entity_id   INT          NULL,
  details     JSON         NULL,
  ip_address  VARCHAR(45)  NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_action (action),
  INDEX idx_user (user_id)
);

SELECT 'ICC MySQL schema created successfully!' AS status;
SHOW TABLES;
