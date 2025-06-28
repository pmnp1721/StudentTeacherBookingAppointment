# API Documentation

This is a client-side application and does not currently interact with a backend API. All data is stored and managed within the browser's Local Storage.

If a backend API were to be implemented, this document would detail the various endpoints, request/response formats, authentication methods, and error handling for interactions between the client and server.

## Placeholder for Future API Endpoints (Example)

### User Management
* `POST /api/users/login` - Authenticate a user.
* `POST /api/users/register` - Register a new user.
* `GET /api/admin/teachers` - Get all teacher accounts (Admin only).
* `POST /api/admin/teachers` - Add a new teacher (Admin only).
* `PUT /api/admin/students/{id}/approve` - Approve a student registration (Admin only).
* `DELETE /api/admin/users/{id}` - Delete a user (Admin only).

### Appointment Management
* `POST /api/appointments` - Book a new appointment (Student only).
* `GET /api/appointments/teacher/{teacherId}` - Get appointments for a specific teacher.
* `GET /api/appointments/student/{studentId}` - Get appointments for a specific student.
* `PUT /api/appointments/{id}/status` - Update appointment status (Teacher/Admin).

### Messaging
* `POST /api/messages` - Send a message from student to teacher.
* `GET /api/messages/teacher/{teacherId}` - Get messages for a teacher.