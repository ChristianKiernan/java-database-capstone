## MySQL Database Design

### Table: appointments
- id: INT, Primary Key, Auto Increment
- doctor_id: INT, Foreign Key → doctors(id)
- patient_id: INT, Foreign Key → patients(id)
- appointment_time: DATETIME, Not Null
- status: INT (0 = Scheduled, 1 = Completed, 2 = Cancelled)

### Table: patients
- id: INT, Primary Key, Auto Increment
- first_name: VARCHAR(100), Not Null
- last_name: VARCHAR(100), Not Null
- email: VARCHAR(255), Not Null, Unique
- password_hash: VARCHAR(255), Not Null
- created_at: DATETIME, Not Null

### Table: doctors
- id: INT, Primary Key, Auto Increment
- first_name: VARCHAR(100), Not Null
- last_name: VARCHAR(100), Not Null
- specialization: VARCHAR(150), Not Null
- email: VARCHAR(255), Not Null, Unique
- phone_number: VARCHAR(20), Null
- password_hash: VARCHAR(255), Not Null
- is_active: BOOLEAN, Default TRUE
- created_at: DATETIME, Not Null

### Table: admin
- id: INT, Primary Key, Auto Increment
- username: VARCHAR(100), Not Null, Unique
- email: VARCHAR(255), Not Null, Unique
- password_hash: VARCHAR(255), Not Null
- role: VARCHAR(50), Not Null, Default 'ADMIN'
- created_at: DATETIME, Not Null

## MongoDB Collection Design
{
  "_id": "ObjectId('67912abcde1234567890abcd')",
  "patientId": 12,
  "doctorId": 4,
  "appointmentId": 51,

  "issuedAt": "2026-01-10T14:22:00Z",
  "status": "active",
  "refillsRemaining": 2,
  "expiresAt": "2026-04-10T23:59:59Z",

  "medication": {
    "name": "Paracetamol",
    "strength": "500mg",
    "form": "tablet",
    "ndc": "00000-0000-00",
    "tags": ["pain", "fever", "otc-friendly"]
  },

  "directions": {
    "sig": "Take 1 tablet every 6 hours as needed for pain.",
    "frequencyPerDayMax": 4,
    "durationDays": 7,
    "startDate": "2026-01-11",
    "endDate": "2026-01-17",
    "warnings": [
      "Do not exceed 4,000mg acetaminophen per day from all sources.",
      "Stop use and contact provider if rash occurs."
    ]
  },

  "doctorNotes": [
    {
      "noteId": "ObjectId('67912abcf01234567890abcd')",
      "createdAt": "2026-01-10T14:23:10Z",
      "type": "clinical",
      "text": "Patient reports mild headache; no red flags. Recommend OTC analgesic and hydration.",
      "tags": ["headache", "triage"]
    },
    {
      "noteId": "ObjectId('67912abd901234567890abcd')",
      "createdAt": "2026-01-10T14:24:02Z",
      "type": "patient-friendly",
      "text": "Use only when you have pain. If symptoms worsen, book a follow-up.",
      "tags": ["instructions"]
    }
  ],

  "pharmacy": {
    "preferred": true,
    "name": "Walgreens - Downtown",
    "phone": "+1-617-555-0139",
    "address": {
      "line1": "100 Main St",
      "city": "Boston",
      "state": "MA",
      "zip": "02110"
    }
  },

  "attachments": [
    {
      "fileId": "ObjectId('67912abe901234567890abcd')",
      "type": "image/png",
      "fileName": "insurance-card.png",
      "storage": {
        "provider": "s3",
        "bucket": "portal-uploads",
        "key": "patients/12/prescriptions/51/insurance-card.png"
      },
      "uploadedAt": "2026-01-10T14:25:30Z",
      "metadata": {
        "sizeBytes": 248331,
        "checksumSha256": "d2c7c9f2c7a7b2d1e9b3d2f1c3a9e8f2d4c1a1b0e3c2d9f1a0b1c2d3e4f5a6b7"
      }
    }
  ],

  "metadata": {
    "version": 3,
    "source": "portal",
    "channel": "telehealth",
    "createdBy": { "role": "doctor", "id": 4 },
    "updatedAt": "2026-01-10T14:26:00Z",
    "audit": [
      {
        "event": "created",
        "at": "2026-01-10T14:22:00Z",
        "by": { "role": "doctor", "id": 4 }
      },
      {
        "event": "pharmacy_updated",
        "at": "2026-01-10T14:25:45Z",
        "by": { "role": "patient", "id": 12 }
      }
    ]
  }
}

