# Smart Attendance Notification Bot

This bot notifies users through ntfy before a class is about to start, helping them stay updated with their schedule in real time.

The user's timetable is stored in a MySQL database, and automated schedulers continuously monitor upcoming classes. Before each class begins, the bot sends a reminder notification directly to the user's phone.

At the end of the day, the system also sends attendance updates for every subject, eliminating the need to manually check attendance portals.

## Features

- Real-time class reminder notifications
- Attendance tracking automation
- End-of-day attendance summary notifications
- Integration with ntfy for lightweight push notifications
- MySQL event scheduler support
