// project/scripts/app.js
// Application State
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '[]');
let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
let messages = JSON.parse(localStorage.getItem('messages') || '[]');
let logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');

// Initialize with default admin
if (users.length === 0) {
    users.push({
        id: 'admin-1',
        email: 'admin@school.edu',
        password: 'admin123',
        name: 'System Administrator',
        type: 'admin',
        approved: true
    });
    saveUsers();
}

// Logging System
function logAction(action, details = '') {
    const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user: currentUser ? currentUser.name : 'System',
        action: action,
        details: details
    };
    logs.push(logEntry);
    saveLogs();
    console.log(`[${logEntry.timestamp}] ${logEntry.user}: ${action} ${details}`);
}

// Local Storage Functions
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
    logAction('Data Save', 'Users updated');
}

function saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    logAction('Data Save', 'Appointments updated');
}

function saveMessages() {
    localStorage.setItem('messages', JSON.stringify(messages));
    logAction('Data Save', 'Messages updated');
}

function saveLogs() {
    localStorage.setItem('systemLogs', JSON.stringify(logs));
}

// Authentication Functions
function showAuthTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function toggleRegistrationFields() {
    const userType = document.getElementById('registerUserType').value;
    document.getElementById('teacherFields').style.display = userType === 'teacher' ? 'block' : 'none';
    document.getElementById('studentFields').style.display = userType === 'student' ? 'block' : 'none';
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('loginUserType').value;

    const user = users.find(u => u.email === email && u.password === password && u.type === userType);
    
    if (user) {
        if (user.type === 'student' && !user.approved) {
            alert('Your registration is pending approval. Please wait for admin approval.');
            logAction('Login Failed', `Student ${email} - Pending approval`);
            return;
        }
        
        currentUser = user;
        logAction('Login Success', `${user.type} - ${user.name}`);
        showDashboard();
    } else {
        alert('Invalid credentials!');
        logAction('Login Failed', `Invalid credentials for ${email}`);
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const userType = document.getElementById('registerUserType').value;
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        alert('User with this email already exists!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        email: email,
        password: password,
        name: name,
        type: userType,
        approved: userType === 'teacher' // Teachers auto-approved, students need approval
    };

    if (userType === 'teacher') {
        newUser.department = document.getElementById('teacherDepartment').value;
        newUser.subject = document.getElementById('teacherSubject').value;
    } else if (userType === 'student') {
        newUser.studentId = document.getElementById('studentId').value;
        newUser.course = document.getElementById('studentCourse').value;
    }

    users.push(newUser);
    saveUsers();
    
    logAction('Registration', `New ${userType} registered - ${name}`);
    
    if (userType === 'student') {
        alert('Registration successful! Please wait for admin approval before logging in.');
    } else {
        alert('Registration successful! You can now log in.');
    }
    
    // Reset form
    document.getElementById('registerForm').querySelector('form').reset();
    showAuthTab('login');
}

function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserType').textContent = currentUser.type;
    
    setupNavigation();
    showUserDashboard();
    loadUserData();
}

function setupNavigation() {
    const navButtons = document.getElementById('navButtons');
    navButtons.innerHTML = `
        <button class="btn btn-secondary" onclick="logout()">Logout</button>
    `;
}

function showUserDashboard() {
    // Hide all dashboard sections
    document.querySelectorAll('#dashboard > .section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show appropriate dashboard
    if (currentUser.type === 'admin') {
        document.getElementById('adminDashboard').style.display = 'block';
    } else if (currentUser.type === 'teacher') {
        document.getElementById('teacherDashboard').style.display = 'block';
    } else if (currentUser.type === 'student') {
        document.getElementById('studentDashboard').style.display = 'block';
    }
}

function logout() {
    logAction('Logout', currentUser.name);
    currentUser = null;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    
    // Reset forms
    document.querySelectorAll('form').forEach(form => form.reset());
}

// Admin Functions
function showAdminTab(tab) {
    document.querySelectorAll('#adminDashboard .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#adminDashboard .section').forEach(section => section.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById('admin' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
    if (tab === 'teachers') loadTeachers();
    else if (tab === 'students') loadStudents();
    else if (tab === 'appointments') loadAllAppointments();
    else if (tab === 'logs') loadSystemLogs();
}

function loadTeachers() {
    const teachers = users.filter(u => u.type === 'teacher');
    const teachersList = document.getElementById('teachersList');
    
    teachersList.innerHTML = teachers.map(teacher => `
        <div class="teacher-card">
            <h4>${teacher.name}</h4>
            <p><strong>Email:</strong> ${teacher.email}</p>
            <p><strong>Department:</strong> ${teacher.department}</p>
            <p><strong>Subject:</strong> ${teacher.subject}</p>
            <button class="btn btn-danger" onclick="deleteUser('${teacher.id}')">Delete</button>
        </div>
    `).join('');
}

function loadStudents() {
    const pendingStudents = users.filter(u => u.type === 'student' && !u.approved);
    const approvedStudents = users.filter(u => u.type === 'student' && u.approved);
    
    document.getElementById('pendingStudents').innerHTML = 
        pendingStudents.length > 0 
        ? `<h4>Pending Approvals</h4>` + pendingStudents.map(student => `
            <div class="card">
                <h4>${student.name}</h4>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Student ID:</strong> ${student.studentId}</p>
                <p><strong>Course:</strong> ${student.course}</p>
                <button class="btn btn-success" onclick="approveStudent('${student.id}')">Approve</button>
                <button class="btn btn-danger" onclick="deleteUser('${student.id}')">Reject</button>
            </div>
        `).join('')
        : '<p>No pending student registrations.</p>';
    
    document.getElementById('approvedStudents').innerHTML = 
        approvedStudents.map(student => `
            <div class="card">
                <h4>${student.name}</h4>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Student ID:</strong> ${student.studentId}</p>
                <p><strong>Course:</strong> ${student.course}</p>
                <button class="btn btn-danger" onclick="deleteUser('${student.id}')">Delete</button>
            </div>
        `).join('');
}

function approveStudent(studentId) {
    const student = users.find(u => u.id === studentId);
    if (student) {
        student.approved = true;
        saveUsers();
        logAction('Student Approved', student.name);
        loadStudents();
        alert('Student approved successfully!');
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const deletedUser = users[userIndex];
            users.splice(userIndex, 1);
            saveUsers();
            logAction('User Deleted', `${deletedUser.type} - ${deletedUser.name}`);
            
            // Also delete related appointments and messages
            appointments = appointments.filter(apt => 
                apt.teacherId !== userId && apt.studentId !== userId
            );
            messages = messages.filter(msg => 
                msg.teacherId !== userId && msg.studentId !== userId
            );
            saveAppointments();
            saveMessages();
            
            if (deletedUser.type === 'teacher') {
                loadTeachers();
            } else {
                loadStudents();
            }
            alert('User deleted successfully!');
        }
    }
}

function addTeacher(event) {
    event.preventDefault();
    
    const name = document.getElementById('newTeacherName').value;
    const email = document.getElementById('newTeacherEmail').value;
    const department = document.getElementById('newTeacherDepartment').value;
    const subject = document.getElementById('newTeacherSubject').value;
    const password = document.getElementById('newTeacherPassword').value;

    // Check if teacher already exists
    if (users.find(u => u.email === email)) {
        alert('Teacher with this email already exists!');
        return;
    }

    const newTeacher = {
        id: Date.now().toString(),
        email: email,
        password: password,
        name: name,
        type: 'teacher',
        department: department,
        subject: subject,
        approved: true
    };

    users.push(newTeacher);
    saveUsers();
    logAction('Teacher Added', `${name} - ${department}`);
    
    hideModal('addTeacherModal');
    loadTeachers();
    alert('Teacher added successfully!');
    
    // Reset form
    document.getElementById('addTeacherModal').querySelector('form').reset();
}

function loadAllAppointments() {
    const appointmentsList = document.getElementById('allAppointmentsList');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found.</p>';
        return;
    }
    
    appointmentsList.innerHTML = appointments.map(appointment => {
        const teacher = users.find(u => u.id === appointment.teacherId);
        const student = users.find(u => u.id === appointment.studentId);
        
        return `
            <div class="appointment-item">
                <h4>Appointment #${appointment.id}</h4>
                <p><strong>Teacher:</strong> ${teacher ? teacher.name : 'Unknown'}</p>
                <p><strong>Student:</strong> ${student ? student.name : 'Unknown'}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Status:</strong> <span class="status-${appointment.status}">${appointment.status.toUpperCase()}</span></p>
                <p><strong>Created:</strong> ${new Date(appointment.createdAt).toLocaleString()}</p>
            </div>
        `;
    }).join('');
}

function loadSystemLogs() {
    const systemLogs = document.getElementById('systemLogs');
    
    if (logs.length === 0) {
        systemLogs.innerHTML = '<p>No system logs found.</p>';
        return;
    }
    
    // Show latest logs first
    const sortedLogs = [...logs].reverse().slice(0, 100); // Show last 100 logs
    
    systemLogs.innerHTML = sortedLogs.map(log => `
        <div class="log-item">
            <strong>${new Date(log.timestamp).toLocaleString()}</strong> - 
            <strong>${log.user}</strong>: ${log.action} ${log.details}
        </div>
    `).join('');
}

// Teacher Functions
function showTeacherTab(tab) {
    document.querySelectorAll('#teacherDashboard .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#teacherDashboard .section').forEach(section => section.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById('teacher' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
    if (tab === 'appointments') loadTeacherAppointments();
    else if (tab === 'messages') loadTeacherMessages();
}

function loadTeacherAppointments() {
    const teacherAppointments = appointments.filter(apt => apt.teacherId === currentUser.id);
    const appointmentsList = document.getElementById('teacherAppointmentsList');
    
    if (teacherAppointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found.</p>';
        return;
    }
    
    appointmentsList.innerHTML = teacherAppointments.map(appointment => {
        const student = users.find(u => u.id === appointment.studentId);
        
        return `
            <div class="appointment-item">
                <h4>Appointment with ${student ? student.name : 'Unknown Student'}</h4>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Status:</strong> <span class="status-${appointment.status}">${appointment.status.toUpperCase()}</span></p>
                <p><strong>Student Email:</strong> ${student ? student.email : 'Unknown'}</p>
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-success" onclick="updateAppointmentStatus('${appointment.id}', 'approved')">Approve</button>
                    <button class="btn btn-danger" onclick="updateAppointmentStatus('${appointment.id}', 'cancelled')">Cancel</button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function scheduleAppointment(event) {
    event.preventDefault();
    
    const date = document.getElementById('scheduleDate').value;
    const time = document.getElementById('scheduleTime').value;
    const duration = document.getElementById('scheduleDuration').value;
    const description = document.getElementById('scheduleDescription').value;

    const newAppointment = {
        id: Date.now().toString(),
        teacherId: currentUser.id,
        studentId: null, // Available for booking
        date: date,
        time: time,
        duration: duration,
        purpose: description || 'Teacher scheduled appointment',
        status: 'available',
        createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    saveAppointments();
    logAction('Appointment Scheduled', `${date} at ${time}`);
    
    alert('Appointment scheduled successfully!');
    event.target.reset();
}

function loadTeacherMessages() {
    const teacherMessages = messages.filter(msg => msg.teacherId === currentUser.id);
    const messagesList = document.getElementById('teacherMessagesList');
    
    if (teacherMessages.length === 0) {
        messagesList.innerHTML = '<p>No messages found.</p>';
        return;
    }
    
    messagesList.innerHTML = teacherMessages.map(message => {
        const student = users.find(u => u.id === message.studentId);
        
        return `
            <div class="message-item">
                <h4>From: ${student ? student.name : 'Unknown Student'}</h4>
                <p><strong>Subject:</strong> ${message.subject}</p>
                <p><strong>Message:</strong> ${message.content}</p>
                <p><strong>Sent:</strong> ${new Date(message.createdAt).toLocaleString()}</p>
                <p><strong>Student Email:</strong> ${student ? student.email : 'Unknown'}</p>
            </div>
        `;
    }).join('');
}

function updateAppointmentStatus(appointmentId, status) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = status;
        saveAppointments();
        logAction('Appointment Updated', `Status changed to ${status} for appointment ${appointmentId}`);
        loadTeacherAppointments();
        alert(`Appointment ${status} successfully!`);
    }
}

// Student Functions
function showStudentTab(tab) {
    document.querySelectorAll('#studentDashboard .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#studentDashboard .section').forEach(section => section.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById('student' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    
    if (tab === 'search') {
        loadTeacherSearch();
        searchTeachers();
    } else if (tab === 'appointments') {
        loadStudentAppointments();
    } else if (tab === 'messages') {
        loadMessageTeachers();
    }
}

function loadTeacherSearch() {
    // This function is called when the search tab is activated
    searchTeachers(); // Perform initial search to show all teachers
}

function searchTeachers() {
    const searchTerm = document.getElementById('teacherSearch').value.toLowerCase();
    const teachers = users.filter(u => u.type === 'teacher');
    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm) ||
        teacher.department.toLowerCase().includes(searchTerm) ||
        teacher.subject.toLowerCase().includes(searchTerm)
    );
    
    const searchResults = document.getElementById('teacherSearchResults');
    
    if (filteredTeachers.length === 0) {
        searchResults.innerHTML = '<p>No teachers found.</p>';
        return;
    }
    
    searchResults.innerHTML = filteredTeachers.map(teacher => `
        <div class="teacher-card">
            <h4>${teacher.name}</h4>
            <p><strong>Department:</strong> ${teacher.department}</p>
            <p><strong>Subject:</strong> ${teacher.subject}</p>
            <p><strong>Email:</strong> ${teacher.email}</p>
            <button class="btn" onclick="openBookingModal('${teacher.id}', '${teacher.name}')">Book Appointment</button>
        </div>
    `).join('');
}

function openBookingModal(teacherId, teacherName) {
    document.getElementById('selectedTeacherId').value = teacherId;
    document.getElementById('selectedTeacherName').value = teacherName;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    showModal('bookAppointmentModal');
}

function bookAppointment(event) {
    event.preventDefault();
    
    const teacherId = document.getElementById('selectedTeacherId').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const purpose = document.getElementById('appointmentPurpose').value;

    // Check for conflicting appointments
    const existingAppointment = appointments.find(apt => 
        apt.teacherId === teacherId && 
        apt.date === date && 
        apt.time === time && 
        apt.status !== 'cancelled'
    );

    if (existingAppointment) {
        alert('This time slot is already booked. Please choose a different time.');
        return;
    }

    const newAppointment = {
        id: Date.now().toString(),
        teacherId: teacherId,
        studentId: currentUser.id,
        date: date,
        time: time,
        purpose: purpose,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    saveAppointments();
    logAction('Appointment Booked', `With teacher ${teacherId} on ${date} at ${time}`);
    
    hideModal('bookAppointmentModal');
    alert('Appointment booked successfully! Waiting for teacher approval.');
    
    // Reset form
    event.target.reset();
}

function loadStudentAppointments() {
    const studentAppointments = appointments.filter(apt => apt.studentId === currentUser.id);
    const appointmentsList = document.getElementById('studentAppointmentsList');
    
    if (studentAppointments.length === 0) {
        appointmentsList.innerHTML = '<p>No appointments found.</p>';
        return;
    }
    
    appointmentsList.innerHTML = studentAppointments.map(appointment => {
        const teacher = users.find(u => u.id === appointment.teacherId);
        
        return `
            <div class="appointment-item">
                <h4>Appointment with ${teacher ? teacher.name : 'Unknown Teacher'}</h4>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Status:</strong> <span class="status-${appointment.status}">${appointment.status.toUpperCase()}</span></p>
                <p><strong>Teacher:</strong> ${teacher ? `${teacher.name} (${teacher.department})` : 'Unknown'}</p>
                <p><strong>Booked:</strong> ${new Date(appointment.createdAt).toLocaleString()}</p>
            </div>
        `;
    }).join('');
}

function loadMessageTeachers() {
    const teachers = users.filter(u => u.type === 'teacher');
    const teacherSelect = document.getElementById('messageTeacher');
    
    teacherSelect.innerHTML = '<option value="">Select Teacher</option>' + 
        teachers.map(teacher => `
            <option value="${teacher.id}">${teacher.name} - ${teacher.department}</option>
        `).join('');
}

function sendMessage(event) {
    event.preventDefault();
    
    const teacherId = document.getElementById('messageTeacher').value;
    const subject = document.getElementById('messageSubject').value;
    const content = document.getElementById('messageContent').value;

    const newMessage = {
        id: Date.now().toString(),
        teacherId: teacherId,
        studentId: currentUser.id,
        subject: subject,
        content: content,
        createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    saveMessages();
    
    const teacher = users.find(u => u.id === teacherId);
    logAction('Message Sent', `To ${teacher ? teacher.name : 'Unknown Teacher'} - Subject: ${subject}`);
    
    alert('Message sent successfully!');
    
    // Reset form
    event.target.reset();
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load user-specific data when dashboard is shown
function loadUserData() {
    if (currentUser.type === 'admin') {
        loadTeachers();
    } else if (currentUser.type === 'teacher') {
        loadTeacherAppointments();
    } else if (currentUser.type === 'student') {
        searchTeachers();
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize logging
logAction('System Start', 'Application initialized');

// Auto-logout after 30 minutes of inactivity (optional)
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (currentUser) {
        inactivityTimer = setTimeout(() => {
            alert('Session expired due to inactivity. Please log in again.');
            logout();
        }, 30 * 60 * 1000); // 30 minutes
    }
}

// Add event listeners for user activity
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('mousemove', resetInactivityTimer);

// Sample data for testing (remove in production)
function addSampleData() {
    // Add sample teachers
    if (users.filter(u => u.type === 'teacher').length === 0) {
        const sampleTeachers = [
            {
                id: 'teacher-1',
                email: 'john.smith@school.edu',
                password: 'teacher123',
                name: 'Dr. John Smith',
                type: 'teacher',
                department: 'Computer Science',
                subject: 'Data Structures',
                approved: true
            },
            {
                id: 'teacher-2',
                email: 'jane.doe@school.edu',
                password: 'teacher123',
                name: 'Prof. Jane Doe',
                type: 'teacher',
                department: 'Mathematics',
                subject: 'Calculus',
                approved: true
            }
        ];
        
        users.push(...sampleTeachers);
        saveUsers();
        logAction('Sample Data', 'Sample teachers added');
    }
}

// Add sample data on first load
addSampleData();