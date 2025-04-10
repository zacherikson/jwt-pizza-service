# Report

## Names

- Zach Erikson
- Ethan Baylock

## Self Attack

### Zach Erikson Self Attack

| Item           | Details                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Result         | SQL Injection                                                                                                                           |
| Date           | April 10, 2025                                                                                                                          |
| Target         | pizza.zacherikson329.click                                                                                                              |
| Classification | Injection                                                                                                                               |
| Severity       | 1                                                                                                                                       |
| Description    | SQL injection. Rewrote all user data to be email=hacker@jwt.com and password=p. Now hacker@jwt.com is admin and no one else has access. |
| Images         | ![self attack](penetrationTests/erikson_self_attack.png)                                                                                |
| Corrections    | Sanitize user inputs in updateUser function                                                                                             |

## Peer Attack

### Zach Erikson Attack on Ethan Baylock

| Item           | Details                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Result         | SQL Injection                                                                                                                           |
| Date           | April 10, 2025                                                                                                                          |
| Target         | pizza.ethanblaylock.click                                                                                                               |
| Classification | Injection                                                                                                                               |
| Severity       | 1                                                                                                                                       |
| Description    | SQL injection. Rewrote all user data to be email=hacker@jwt.com and password=p. Now hacker@jwt.com is admin and no one else has access. |
| Images         | ![attack on ethan](penetrationTests/erikson_attack_on_ethan.png)                                                                        |
| Corecctions    | Sanitize user inputs in updateUser function                                                                                             |

## Learnings

One thing we learned about was the importance of sanitizing user inputs. SQL Injections are dangerous but they can be prevented by using proper protocols. There are already some safety nets built in to the js library mysql2 to prevent SQL attacks, but it's still possible. For example, you cannot have multiple queries in a single line. Doing "UPDATE user.....; DROP TABLE user; -- " would not work. However, you could ignore trying to drop a table and just alter the user data. If you properly sanitize user inputs, then this is completely avoided.
