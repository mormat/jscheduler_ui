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
    
