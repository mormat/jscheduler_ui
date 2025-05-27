@others
Feature: others features

    Scenario: Quick start
        # Given the "temp/quickstart" page contains the code in "Quick start" of README.md
        When I open the "temp\quickstart" page
        Then the 'interview' event should be displayed at "Mon, Sep 16" from '10:00' to '12:00'
        And the 'meeting' event should be displayed at "Tue, Sep 17" from '14:00' to '16:00'

    Scenario Outline: setting the `currentDate` prop
        When I render a scheduler with the options below:
        """
            { "currentDate": "<currentDate>" }
        """
        Then I should see '<expectedText>'

        Examples: 
            | currentDate | expectedText |
            | 2024-09-15  | Sun, Sep 15  |
            | 2024-09-17  | Tue, Sep 17  |
    
    Scenario: minHour < 0 and maxHour > 23
        When I render a scheduler with the options below:
        """
            { minHour: -1, maxHour: 25 }
        """
        Then I should see in "table tbody" only "00:00 01:00 02:00 03:00 04:00 05:00 06:00 07:00 08:00 09:00 10:00 11:00 12:00 13:00 14:00 15:00 16:00 17:00 18:00 19:00 20:00 21:00 22:00 23:00"

    Scenario: minHour and maxHour as strings
        When I render a scheduler with the options below:
        """
            { minHour: "11", maxHour: "18" }
        """
        Then I should see in "table tbody" only "11:00 12:00 13:00 14:00 15:00 16:00 17:00 18:00"

    Scenario: minHour > maxHour
        When I render a scheduler with the options below:
        """
            { minHour: 18, maxHour: 10 }
        """
        Then I should see in "table tbody" only ""

    Scenario: minHour = maxHour
        When I render a scheduler with the options below:
        """
            { minHour: 12, maxHour: 12 }
        """
        Then I should see in "table tbody" only "12:00"

    Scenario: display default group in last row
        When I render a scheduler with the options below:
        """
            { 
                showGroups: true,
                groups: [
                    { id: 1, label: "Room A" }
                ],
                currentDate: "2024-08-13",
                events: [
                    { 
                        label: "task1", 
                        start: "2024-08-12 10:00",
                        group_id: null
                    },
                    { 
                        label: "task2", 
                        start: "2024-08-14 10:00",
                        group_id: "some group"
                    },
                    { 
                        label: "task2", 
                        start: "2024-08-14 10:00",
                        group_id: "another group"
                    }
                ]
            }
        """
        Then I should see "some group" in row 2
        And I should see "another group" in row 3

    Scenario: always display events in groups even if group is missing
        When I render a scheduler with the options below:
        """
            { 
                showGroups: true,
                groups: [
                    { id: 1, label: "Room A" }
                ],
                currentDate: "2024-08-13",
                events: [
                    { 
                        label: "task1", 
                        start: "2024-08-12 10:00",
                        group_id: "Tasks"
                    },
                    { 
                        label: "task2", 
                        start: "2024-08-14 10:00",
                        group_id: null
                    },
                    { 
                        label: "task3", 
                        start: "2024-08-16 10:00"
                    },

                ]
            }
        """
        Then I should see 3 "tbody tr" elements
        And the "task1" event should be displayed from "12" to "12" in "Tasks" group
        And the "task2" event should be displayed from "14" to "14" in "" group
        And the "task3" event should be displayed from "16" to "16" in "" group

    Scenario: events with unknown group should be displayed in default group
        When I render a scheduler with the options below:
        """
            { 
                showGroups: true,
                groups: [
                    { id: 1, label: "Room A" },
                    { id: 2, label: "Room B" },
                    { id: null, label: "others" }
                ],
                currentDate: "2024-08-13",
                events: [
                    { 
                        label: "task1", 
                        start: "2024-08-12 10:00",
                        group_id: 3
                    },
                    { 
                        label: "task2", 
                        start: "2024-08-14 10:00",
                        group_id: null
                    },
                    { 
                        label: "task3", 
                        start: "2024-08-16 10:00",
                        group_id: 0
                    }
                ]
            }
        """
        Then the "task1" event should be displayed from "12" to "12" in "others" group
        And the "task2" event should be displayed from "14" to "14" in "others" group
        And the "task3" event should be displayed from "16" to "16" in "others" group
