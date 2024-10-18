@demo
Feature: demo page

    Background:
        Given today is "2024-08-13" 

    Scenario: Switch between multiple weeks
        When I open the "index" page
        Then the scheduler should be in week view
        When I click on "month"
        Then the scheduler should be in month view
        When I click on "week"
        Then the scheduler should be in week view
        When I click on "day"
        Then the scheduler should be in day view

    Scenario: Browse dates in week view
        When I open the "index" page
        And I click on "day"
        Then I should see "Tuesday, August 13, 2024"
        When I click on ">"
        Then I should see "Wednesday, August 14, 2024"
        When I click on "today"
        Then I should see "Tuesday, August 13, 2024"
        When I click on "<"
        Then I should see "Monday, August 12, 2024"

    Scenario: Browse dates in week view
        When I open the "index" page
        Then I should see "Aug 12, 2024 - Aug 18, 2024"
        When I click on ">"
        Then I should see "Aug 19, 2024 - Aug 25, 2024"
        When I click on "today"
        Then I should see "Aug 12, 2024 - Aug 18, 2024"
        When I click on "<"
        Then I should see "Aug 5, 2024 - Aug 11, 2024"
        
    Scenario: Browse dates in month view
        When I open the "index" page
        And I click on "month"
        Then I should see "August 2024"
        When I click on ">"
        Then I should see "September 2024"
        When I click on "today"
        Then I should see "August 2024"
        When I click on "<"
        Then I should see "July 2024"

    # All the 'click', 'resize' and 'drop' listeners should still work if they are put together
    Scenario: Event should be clickable
        When I open the "index" page
        And I click on the "interview" event
        Then I should see "clicked on 'interview'"
        When I click on the "training course" event
        Then I should see "clicked on 'training course'"
        When I click on "month"
        And I click on the "interview" event
        Then I should see "clicked on 'interview'"

    @drag_and_drop
    Scenario: Event should be resizable
        When I open the "index" page
        And I resize the "interview" event to "14:00"
        Then the "interview" event should be displayed at "Tue, Aug 13" from "10:00" to "14:00"

    @drag_and_drop @todo
    Scenario: Event should be draggable
        When I open the "index" page
        And I drag the "interview" event to "Mon, Aug 12" at "10:00"
        Then the "interview" event should be displayed at "Mon, Aug 12" from "10:00" to "12:00"
        When I drag the "training course" event to "Wed, Aug 14"
        Then the "training course" event should be displayed from "Wed, Aug 14" to "Fri, Aug 16"
        When I click on "month"
        And I drag the "training course" event to "22"
        Then the "training course" event should be displayed from "22" to "24"
