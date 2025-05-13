@others
Feature: others features

    Scenario: Quick start
        # Given the "temp/quickstart" page contains the code in "Quick start" of README.md
        When I open the "temp\quickstart" page
        Then the 'interview' event should be displayed at "Mon, Sep 16" from '10:00' to '12:00'
        And the 'meeting' event should be displayed at "Tue, Sep 17" from '14:00' to '16:00'

    Scenario Outline: setting the `currentDate` prop
        Given the "currentDate" prop equals "<currentDate>"
        When I open the "tests" page
        Then I should see '<expectedText>'

        Examples: 
        | currentDate | expectedText |
        | 2024-09-15  | Sun, Sep 15  |
        | 2024-09-17  | Tue, Sep 17  |
    
    Scenario: minHour < 0 and maxHour > 23
        When I open the "tests/minHour_lt_0_and_maxHour_gt_23" page
        Then I should see in "table tbody" only "00:00 01:00 02:00 03:00 04:00 05:00 06:00 07:00 08:00 09:00 10:00 11:00 12:00 13:00 14:00 15:00 16:00 17:00 18:00 19:00 20:00 21:00 22:00 23:00"
    
    Scenario: minHour and maxHour as strings
        When I open the "tests/minHour_and_maxHour_as_strings" page
        Then I should see in "table tbody" only "11:00 12:00 13:00 14:00 15:00 16:00 17:00 18:00"

    Scenario: minHour > maxHour
        When I open the "tests/minHour_gt_maxHour" page
        Then I should see in "table tbody" only ""

    @wip
    Scenario: minHour = maxHour
        When I open the "tests/minHour_eq_maxHour" page
        Then I should see in "table tbody" only "12:00"
