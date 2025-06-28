# Testing Documentation

This document outlines the testing strategy for the Student-Teacher Booking System. As this is currently a client-side application using Local Storage, testing primarily focuses on manual functional testing and browser-based validation.

## Manual Functional Testing

All features should be manually tested across different user roles (Admin, Teacher, Student) to ensure they function as expected.

### Test Cases (Examples)

#### Authentication
* **Login as Admin**:
    * **Input**: `admin@school.edu`, `admin123`, `Admin`
    * **Expected**: Successfully logs in, Admin dashboard is displayed.
* **Login as Teacher (existing)**:
    * **Input**: `john.smith@school.edu`, `teacher123`, `Teacher` (using sample data)
    * **Expected**: Successfully logs in, Teacher dashboard is displayed.
* **Login as Student (approved)**:
    * **Input**: Student email, password, `Student` (after admin approval)
    * **Expected**: Successfully logs in, Student dashboard is displayed.
* **Login as Student (pending approval)**:
    * **Input**: Student email, password, `Student` (before admin approval)
    * **Expected**: Login fails with "Pending approval" message.
* **Invalid Login**:
    * **Input**: Incorrect email, password, or user type.
    * **Expected**: "Invalid credentials" alert.
* **Register New Student**:
    * **Input**: Valid student details.
    * **Expected**: "Registration successful! Please wait for admin approval..." message. Student is added to pending list for admin.
* **Register New Teacher**:
    * **Input**: Valid teacher details.
    * **Expected**: "Registration successful! You can now log in." message. Teacher is immediately usable.

#### Admin Dashboard
* **Manage Teachers**:
    * Verify all teachers are listed.
    * Add a new teacher: Verify teacher appears in the list.
    * Delete a teacher: Verify teacher is removed, and associated appointments/messages are also removed.
* **Manage Students**:
    * Verify pending student registrations are shown.
    * Approve a pending student: Verify student moves to approved list and can log in.
    * Reject/Delete a student: Verify student is removed.
* **All Appointments**:
    * Verify all appointments (pending, approved, cancelled, available) are listed correctly with teacher and student names.
* **System Logs**:
    * Verify system actions (login, logout, data saves, approvals, deletions, etc.) are logged correctly with timestamps and user info.

#### Teacher Dashboard
* **My Appointments**:
    * Verify only appointments related to the logged-in teacher are displayed.
    * Approve a pending appointment: Verify status changes to "APPROVED".
    * Cancel a pending appointment: Verify status changes to "CANCELLED".
* **Schedule Appointment**:
    * Schedule a new available slot: Verify the slot appears in the teacher's appointment list as "AVAILABLE" and can be seen by students.
* **Messages**:
    * Verify messages sent by students to this teacher are displayed.

#### Student Dashboard
* **Search Teachers**:
    * Search by full name, department, and subject.
    * Verify relevant teachers appear in results.
    * Verify "No teachers found" message when no match.
* **Book Appointment**:
    * Select a teacher from search results.
    * Choose an available date/time.
    * Verify "Appointment booked successfully! Waiting for teacher approval." message.
    * Verify the appointment appears in "My Appointments" with "PENDING" status.
    * Attempt to book a conflicting time slot: Verify error message.
* **My Appointments**:
    * Verify only appointments booked by the logged-in student are displayed with correct status.
* **Send Message**:
    * Select a teacher from the dropdown.
    * Send a message: Verify "Message sent successfully!" message. Verify the message appears in the teacher's messages.

## Browser Compatibility Testing

Test the application across different web browsers (e.g., Chrome, Firefox, Edge, Safari) to ensure consistent functionality and styling.

## Local Storage Inspection

Use browser developer tools to inspect the "Application" or "Storage" tab to verify that:
* `users`, `appointments`, `messages`, and `systemLogs` data are correctly stored.
* Data is updated appropriately after actions (e.g., user registration, appointment booking, status changes).
* Data persists across browser sessions.

## Future Testing (with Backend)

If a backend were implemented, the following testing types would be added:
* **Unit Testing**: For individual functions and components (using frameworks like Jest or Mocha).
* **Integration Testing**: To ensure different parts of the application (e.g., frontend interacting with backend API) work together seamlessly.
* **End-to-End Testing**: Simulating real user scenarios (using tools like Cypress or Playwright).
* **API Testing**: Verifying backend API endpoints directly (using tools like Postman or Insomnia).
* **Performance Testing**: Assessing application responsiveness and scalability.
* **Security Testing**: Identifying vulnerabilities (e.g., SQL injection, XSS).