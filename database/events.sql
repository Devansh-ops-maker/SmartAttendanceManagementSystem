USE SmartAttendanceManagementSystem;

DELIMITER //

CREATE EVENT IF NOT EXISTS Class_To_Start --For classes about to be started we will prepare for a notification
ON SCHEDULE EVERY 15 MINTUE 
DO 
BEGIN 
    UPDATE Timetable
    SET status = 'Open'
    WHERE TIMEDIFF(CURRENT_TIME, start_time) <= '00:15:00'
    AND start_time <= CURRENT_TIME;
END //

CREATE EVENT IF NOT EXISTS Class_Started --For classes that are started now we will again change their status to be checked for attendance
ON SCHEDULE EVERY 10 MINTUE
DO
BEGIN
    UPDATE Timetable
    SET status = 'Check'
    WHERE TIMEDIFF (CURRENT_TIME, end_time) <= '00:10:00'
    AND end_time <= CURRENT_TIME;
END //

CREATE EVENT IF NOT EXISTS Class_Ended -- For classes that are ended now we will change their status to closed 
ON SCHEDULE EVERY 10 MINTUE
DO
BEGIN 
    Update Timetable
    SET status = 'Closed'
    WHERE TIMEDIFF (CURRENT_TIME,end_time) <= '00:20:00'
    AND end_time <= CURRENT_TIME;
END //

DELIMITER ; 