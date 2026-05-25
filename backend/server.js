require('dotenv').config();

const mysql = require("mysql2/promise");
const axios = require("axios");
const cron = require("node-cron");
const express = require("express");

const app = express();

app.use(express.json());

async function getConnection() {

    return await mysql.createConnection({
        host: process.env.SQLHOST,
        user: process.env.SQLUSERNAME,
        password: process.env.SQLPASSWORD,
        database: process.env.SQLDATABASE
    });
}

const con= mysql.createConnection({
    host: process.env.SQLHOST,
    user: process.env.SQLUSERNAME,
    password: process.env.SQLPASSWORD,
    database: process.env.SQLDATABASE
});

con.connect(function (err){
    if(err) throw err;
    console.log("Connected to MySQL database!");
});

async function checkOpenItems() {

    const connection = await mysql.createConnection({
        host: process.env.SQLHOST,
        user: process.env.SQLUSERNAME,
        password: process.env.SQLPASSWORD,
        database: process.env.SQLDATABASE
    });

    try {

        const [rows] = await connection.execute(
            "SELECT * FROM Timetable WHERE status = ?",
            ["Open"]
        );

        for (const item of rows) {

            await axios.post(
                process.env.NOTIFYURL,
                `Class  ${item.course_name} is about to start at ${item.start_time}.'`,
                {
                    headers: {
                        Title: "Class Start Alert",
                        Priority: "5",
                        Tags: "Reminder"
                    }
                }
            );

            console.log(`Notification sent for class ${item.course_name} starting at ${item.start_time} `);
        }

    } catch (err) {
        console.log(err.message);
    }

    await connection.end();
}

cron.schedule("*/10 * * * *", () => {
    console.log("Checking Classes that are about to start...");
    checkOpenItems();
});

async function sendAttendanceNotification(item) {

    const attendedURL =
        `${process.env.BASE_URL}/attendance/${item.course_code}/attended/${item.classtype}`;

    const missedURL =
        `${process.env.BASE_URL}/attendance/${item.course_code}/missed/${item.classtype}`;

    const cancelledURL =
        `${process.env.BASE_URL}/attendance/${item.course_code}/cancelled/${item.classtype}`;

    const message =
`Class ${item.course_name} has ended.

Attended:
${attendedURL}

Missed:
${missedURL}

Cancelled:
${cancelledURL}`;

    await axios.post(
        process.env.NOTIFYURL,
        message,
        {
            headers: {
                Title: "Attendance Check",
                Priority: "5",
                Tags: "warning,school"
            }
        }
    );
}

cron.schedule("*/10 * * * *", async () => {

    console.log("Checking classes...");

    let connection;

    try {

        connection = await getConnection();

        const [rows] = await connection.execute(
            "SELECT * FROM Timetable WHERE status = ?",
            ["Check"]
        );

        for (const item of rows) {

            await sendAttendanceNotification(item);

            await connection.execute(
                `UPDATE Timetable
                 SET status = 'Closed'
                 WHERE course_code = ?
                 AND start_time = ?`,
                [item.course_code, item.start_time]
            );

            console.log(
                `Notification sent for ${item.course_name}`
            );
        }

    } catch (err) {

        console.log(err.message);

    } finally {

        if (connection) {
            await connection.end();
        }
    }

});

app.get(
    "/attendance/:courseCode/attended/:classtype",
    async (req, res) => {

        let connection;

        try {

            connection = await getConnection();

            const { courseCode, classtype } = req.params;

            if (classtype === "Lecture") {

                await connection.execute(
                    `UPDATE Attendance
                     SET lectures_attended =
                     lectures_attended + 1
                     WHERE course_code = ?`,
                    [courseCode]
                );

            } else if (classtype === "Lab") {

                await connection.execute(
                    `UPDATE Attendance
                     SET practicals_attended =
                     practicals_attended + 1
                     WHERE course_code = ?`,
                    [courseCode]
                );

            } else {

                await connection.execute(
                    `UPDATE Attendance
                     SET tutorials_attended =
                     tutorials_attended + 1
                     WHERE course_code = ?`,
                    [courseCode]
                );
            }

            res.send("Attendance marked as attended");

        } catch (err) {

            res.status(500).send(err.message);

        } finally {

            if (connection) {
                await connection.end();
            }
        }
    }
);

app.get(
    "/attendance/:courseCode/missed/:classtype",
    async (req, res) => {

        let connection;

        try {

            connection = await getConnection();

            const { courseCode, classtype } = req.params;

            if (classtype === "Lecture") {

                await connection.execute(
                    `UPDATE Attendance
                     SET lectures_missed =
                     lectures_missed + 1
                     WHERE course_code = ?`,
                    [courseCode]
                );

            } else if (classtype === "Lab") {

                await connection.execute(
                    `UPDATE Attendance
                     SET practicals_missed =
                     practicals_missed + 1
                     WHERE course_code = ?`,
                    [courseCode]
                );

            } else {

                await connection.execute(
                    `UPDATE Attendance
                     SET tutorials_missed =
                     tutorials_missed + 1
                     WHERE course_code = ?`,
                    [courseCode]
                );
            }

            res.send("Attendance marked as missed");

        } catch (err) {

            res.status(500).send(err.message);

        } finally {

            if (connection) {
                await connection.end();
            }
        }
    }
);

app.get(
    "/attendance/:courseCode/cancelled/:classtype",
    async (req, res) => {

        res.send("Class marked as cancelled");
    }
);

app.listen(3000, () => {

    console.log("Server running on port 3000");
});
