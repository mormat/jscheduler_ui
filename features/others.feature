@others
Feature: others features

    Scenario: Quick start
        # Given the "temp/quickstart" page contains the code in "Quick start" of README.md
        When I open the "temp\quickstart" page
        Then the 'interview' event should be displayed at "Mon, Sep 16" from '10:00' to '12:00'
        And the 'meeting' event should be displayed at "Tue, Sep 17" from '14:00' to '16:00'

    @wtf
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
