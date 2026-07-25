const { getPool } = require('../config/mysql');

async function ensureNotificationsTable() {
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id                INT AUTO_INCREMENT PRIMARY KEY,
      title             VARCHAR(200)  NOT NULL,
      message           TEXT          NOT NULL,
      target            ENUM('All','Patients','Doctors','Hospitals') NOT NULL DEFAULT 'All',
      status            ENUM('Draft','Sent','Failed') NOT NULL DEFAULT 'Sent',
      reach_count       INT           NOT NULL DEFAULT 0,
      sent_by           INT           NULL,
      sent_at           DATETIME      NULL,
      created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      recipient_user_id INT           NULL,
      recipient_role    VARCHAR(40)   NULL,
      category          VARCHAR(60)   NULL,
      entity_type       VARCHAR(40)   NULL,
      entity_id         INT           NULL,
      action_url        VARCHAR(255)  NULL,
      is_read           TINYINT(1)    NOT NULL DEFAULT 0,
      metadata_json     JSON          NULL,
      FOREIGN KEY (sent_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_target (target),
      INDEX idx_status (status),
      INDEX idx_recipient_user (recipient_user_id),
      INDEX idx_recipient_role (recipient_role),
      INDEX idx_is_read (is_read)
    )
  `);

  const requiredColumns = [
    "ADD COLUMN recipient_user_id INT NULL AFTER created_at",
    "ADD COLUMN recipient_role VARCHAR(40) NULL AFTER recipient_user_id",
    "ADD COLUMN category VARCHAR(60) NULL AFTER recipient_role",
    "ADD COLUMN entity_type VARCHAR(40) NULL AFTER category",
    "ADD COLUMN entity_id INT NULL AFTER entity_type",
    "ADD COLUMN action_url VARCHAR(255) NULL AFTER entity_id",
    "ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER action_url",
    "ADD COLUMN metadata_json JSON NULL AFTER is_read",
  ];

  for (const statement of requiredColumns) {
    try {
      await pool.execute(`ALTER TABLE notifications ${statement}`);
    } catch (error) {
      if (!String(error.message).includes('Duplicate column name')) {
        throw error;
      }
    }
  }

  const requiredIndexes = [
    'CREATE INDEX idx_recipient_user ON notifications (recipient_user_id)',
    'CREATE INDEX idx_recipient_role ON notifications (recipient_role)',
    'CREATE INDEX idx_is_read ON notifications (is_read)',
  ];

  for (const statement of requiredIndexes) {
    try {
      await pool.execute(statement);
    } catch (error) {
      if (!String(error.message).includes('Duplicate key name')) {
        throw error;
      }
    }
  }
}

async function ensureOperationalSchema() {
  await ensureNotificationsTable();
  await ensureLeadWorkflowColumns();
  await ensureAppointmentWorkflowColumns();
  await ensureEmployeesColumns();
  await ensurePatientsTable();
}

async function ensureLeadWorkflowColumns() {
  const pool = getPool();

  const requiredColumns = [
    "ADD COLUMN pipeline_stage VARCHAR(80) NOT NULL DEFAULT 'New' AFTER status",
    "ADD COLUMN is_spam TINYINT(1) NOT NULL DEFAULT 0 AFTER pipeline_stage",
    "ADD COLUMN is_archived TINYINT(1) NOT NULL DEFAULT 0 AFTER is_spam",
    "ADD COLUMN follow_up_at DATETIME NULL AFTER is_archived",
    "ADD COLUMN last_contacted_at DATETIME NULL AFTER follow_up_at",
  ];

  for (const statement of requiredColumns) {
    try {
      await pool.execute(`ALTER TABLE leads ${statement}`);
    } catch (error) {
      if (!String(error.message).includes('Duplicate column name')) {
        throw error;
      }
    }
  }

  const requiredIndexes = [
    'CREATE INDEX idx_pipeline_stage ON leads (pipeline_stage)',
    'CREATE INDEX idx_is_spam ON leads (is_spam)',
    'CREATE INDEX idx_is_archived ON leads (is_archived)',
  ];

  for (const statement of requiredIndexes) {
    try {
      await pool.execute(statement);
    } catch (error) {
      if (!String(error.message).includes('Duplicate key name')) {
        throw error;
      }
    }
  }

  await pool.execute("UPDATE leads SET pipeline_stage = status WHERE pipeline_stage IS NULL OR pipeline_stage = ''");
}

async function ensureAppointmentWorkflowColumns() {
  const pool = getPool();

  const requiredColumns = [
    "ADD COLUMN workflow_status VARCHAR(80) NULL AFTER status",
    "ADD COLUMN admin_note TEXT NULL AFTER workflow_status",
    "ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
  ];

  for (const statement of requiredColumns) {
    try {
      await pool.execute(`ALTER TABLE appointments ${statement}`);
    } catch (error) {
      if (!String(error.message).includes('Duplicate column name')) {
        throw error;
      }
    }
  }

  const requiredIndexes = [
    'CREATE INDEX idx_workflow_status ON appointments (workflow_status)',
  ];

  for (const statement of requiredIndexes) {
    try {
      await pool.execute(statement);
    } catch (error) {
      if (!String(error.message).includes('Duplicate key name')) {
        throw error;
      }
    }
  }

  await pool.execute("UPDATE appointments SET workflow_status = status WHERE workflow_status IS NULL OR workflow_status = ''");
}

async function ensureEmployeesColumns() {
  const pool = getPool();

  const requiredColumns = [
    "ADD COLUMN city VARCHAR(80) NULL AFTER phone",
    "ADD COLUMN last_login_at DATETIME NULL AFTER status",
    "ADD COLUMN leads_assigned INT NOT NULL DEFAULT 0 AFTER last_login_at",
  ];

  for (const statement of requiredColumns) {
    try {
      await pool.execute(`ALTER TABLE employees ${statement}`);
    } catch (error) {
      if (!String(error.message).includes('Duplicate column name')) {
        throw error;
      }
    }
  }
}

async function ensurePatientsTable() {
  const pool = getPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_name VARCHAR(120) NOT NULL,
      patient_age TINYINT UNSIGNED NULL,
      patient_gender VARCHAR(20) NULL,
      patient_phone VARCHAR(20) NOT NULL,
      patient_email VARCHAR(120) NULL,
      patient_city VARCHAR(80) NULL,
      concern VARCHAR(255) NULL,
      status ENUM('Active','Inactive','Blocked','Archived','Deletion Requested') NOT NULL DEFAULT 'Active',
      assigned_consultant_id INT NULL,
      source VARCHAR(80) NULL,
      last_contacted_at DATETIME NULL,
      next_follow_up_at DATETIME NULL,
      internal_notes TEXT NULL,
      joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_patient_phone (patient_phone),
      KEY idx_patient_email (patient_email),
      KEY idx_patient_status (status),
      KEY idx_patient_consultant (assigned_consultant_id),
      CONSTRAINT fk_patients_consultant FOREIGN KEY (assigned_consultant_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
}

module.exports = {
  ensureOperationalSchema,
};
