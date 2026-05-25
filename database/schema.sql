CREATE DATABASE IF NOT EXISTS `SmartAttendanceManagementSystem`;
    
USE SmartAttendanceManagementSystem;

CREATE TABLE IF NOT EXISTS 'Timetable'(  --The schema of the my timetable necessary for the service 
    course_code INT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    classtype enum('Lecture', 'Lab', 'Tutorial') NOT NULL,
    credits FLOAT NOT NULL,
    status enum('Open','Check','Closed') DEFAULT 'Closed' NOT NULL,
)

CREATE TABLE IF NOT EXISTS 'Attendance'{ --The schema of attendance system necessary for the service
     course_code INT NOT NULL,
     course_name VARCHAR(255) NOT NULL,
     lectures_attended INT NOT NULL,
     lectures_missed INT NOT NULL,
     practicals_attended INT NOT NULL,
     practicals_missed INT NOT NULL,
     Tutorials_attended INT NOT NULL,
    Tutorials_missed INT NOT NULL,
    Attendance_percentage FLOAT DEFAULT 0 NOT NULL,
}
