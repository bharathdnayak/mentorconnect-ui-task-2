# MentorConnect — RESTful API Documentation

## 1. API Conventions
- **Base URL**: `/api/v1`
- **Protocol**: HTTP/1.1 or HTTP/2 over TLS
- **Authentication**: Bearer Token in `Authorization` header (`Bearer <JWT_ACCESS_TOKEN>`)
- **Data Format**: `application/json` (or `text/csv` for data exports)

---

## 2. Standard Response Structure

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed / Unauthorized access",
  "errors": [
    { "field": "email", "message": "Please enter a valid email address" }
  ]
}
```

---

## 3. API Endpoint Reference

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticates user; returns Access & Refresh tokens. |
| `POST` | `/auth/register-student` | Public | Registers a new student mentee account. |
| `GET` | `/auth/me` | Authenticated | Fetches current user session, profile, and role. |
| `POST` | `/auth/refresh-token` | Public | Issues a new short-lived access token using valid refresh token. |

### Student Workflows (`/api/v1/students`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/students/dashboard` | Student | Aggregated metrics: profile readiness, mentor, upcoming meetings. |
| `GET` | `/students/profile` | Student | Fetches full mentoring profile. |
| `PUT` | `/students/profile` | Student | Updates permitted profile fields (skills, career goals, bio). |
| `GET` | `/students/my-mentor` | Student | Retrieves assigned mentor information and contact details. |
| `GET` | `/students/recommendations` | Student | Runs explainable recommendation engine for student profile. |
| `POST` | `/students/change-request` | Student | Submits official mentor change request to HOD. |
| `GET` | `/students/sessions` | Student | Lists past and scheduled sessions with shared notes. |

### Faculty Mentor Workflows (`/api/v1/mentors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/mentors/dashboard` | Mentor | Mentor metrics: capacity usage, upcoming sessions, pending actions. |
| `GET` | `/mentors/profile` | Mentor | Fetches faculty profile and capacity quota. |
| `PUT` | `/mentors/profile` | Mentor | Updates faculty designation, expertise tags, and biography. |
| `GET` | `/mentors/mentees` | Mentor | Lists assigned mentees with search and semester filtering. |
| `GET` | `/mentors/mentees/:id` | Mentor | Opens mentee record (restricted to assigned mentees). |

### HOD Administration & Pairings (`/api/v1/assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/assignments` | HOD | Lists all assignments with search, status, and pagination. |
| `POST` | `/assignments` | HOD | Creates mentor-mentee pairing with capacity enforcement. |
| `POST` | `/assignments/reassign` | HOD | Reassigns student with historical preservation and notifications. |
| `GET` | `/assignments/unassigned-students` | HOD | Identifies unassigned students requiring faculty pairing. |
| `GET` | `/assignments/mentor-workloads` | HOD | Live breakdown of mentor capacity, active loads, and availability. |

### Recommendations Engine (`/api/v1/recommendations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/recommendations/match/:studentId` | HOD, Mentor | Dynamic execution of compatibility scoring for any student. |
| `POST` | `/recommendations/accept` | HOD | Accepts recommendation and converts into active assignment. |

### Mentoring Sessions (`/api/v1/sessions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/sessions` | Mentor, HOD | Schedules mentoring session with mentee. |
| `GET` | `/sessions/:id` | Authorized | Fetches session details with role-based note filtering. |
| `PATCH` | `/sessions/:id/status` | Mentor, HOD | Updates session status (Completed, Cancelled, Rescheduled). |
| `POST` | `/sessions/:id/notes` | Mentor, HOD | Adds meeting note with visibility control. |
| `POST` | `/sessions/:id/feedback` | Student | Submits 1–5 star rating and feedback for completed session. |

### Reports & CSV Exports (`/api/v1/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/overview` | HOD | Department summary statistics and Recharts chart data. |
| `GET` | `/reports/export-assignments-csv` | HOD | Streams sanitized CSV file of all mentor assignments. |
| `GET` | `/reports/export-sessions-csv` | HOD | Streams sanitized CSV file of all mentoring sessions. |
| `GET` | `/reports/export-mentors-csv` | HOD | Streams sanitized CSV file of faculty workloads. |
