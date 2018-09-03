# Volunteer Time Tracker
Welcome to the volunteer time tracker application for CATR. 

## Structure
Here are the technical details needed to operate the Volunteer Time Tracker. A guide for volunteers is provided [here](volunteers.md).

### Data
All the data is stored in the `./times/` directory. The format is as follows:

```
name, startTime, endTime, category
```

There will be multiple files in the times directory the one with the highest number is the latest data file. All the other files are historical copies of previous revisions. When someone checks in, checks out, or an admin edits historical data a copy is created to ensure the data is never lost in the case of a problem. 

To change the list of volunteers open at the `./volunteers.csv` and to change the list of categories edit the `./categories.csv`.

## Admin Portal
To access the admin portal go `/admin/`.

### Totals
When you're ready to calculate the total hours. Go to the "Totals" page in the admin portal. This page displays the total hours for each person for the given category (located at the top of the table) that are contained in the latest data file.

To select a different category select it from the categories dropdown menu.

### Make Fixes

