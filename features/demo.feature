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

    @drag_and_drop
    Scenario: Event should be draggable
        When I open the "index" page
        And I drag the "interview" event to "Mon, Aug 12" at "10:00"
        Then the "interview" event should be displayed at "Mon, Aug 12" from "10:00" to "12:00"
        When I drag the "training course" event to "Wed, Aug 14"
        Then the "training course" event should be displayed from "Wed, Aug 14" to "Fri, Aug 16"
        When I click on "month"
        And I drag the "training course" event to day 22
        Then the "training course" event should be displayed from day 22 to day 24

    @groups
    Scenario Outline: Displaying events with groups
        When I open the "index" page
        And I click on "<view>"
        And I click on "show groups"
        Then the "<event_name>" event should be displayed from "<start>" to "<end>" in "<group>" group

        Examples:
        | event_name      | view  | start  | end    | group   |
        | interview       | week  | Tue 13 | Tue 13 | Room B  |
        | interview       | month | T 13   | T 13   | Room B  |
        | interview       | year  | Aug    | Aug    | Room B  |
        | meeting         | week  | Sat 17 | Sat 17 |         |
        | meeting         | month | S 17   | S 17   |         |
        | meeting         | year  | Aug    | Aug    |         |
        | training course | week  | Thu 15 | Sat 17 |         | # in week view, the spanned event should also be visible
        | interview       | day   | 10:00  | 10:00  | Room B  |
        | medical checkup | day   | 14:00  | 14:00  |         |
        
    @groups
    Scenario: The default group should be in the last row
        When I open the "index" page
        And I click on "month"
        And I click on "show groups"
        Then I should see "Room D" in row 4
        And I should see "another group" in row 5

    @groups @drag_and_drop @week
    Scenario Outline: Dragging and dropping events when showing groups in week view
        When I open the "index" page
        And I click on "week"
        And I click on "show groups"
        When I drag the "<event_name>" event to "<start>" in "<group>" group
        Then the "<event_name>" event should be displayed from "<start>" to "<end>" in "<group>" group

        Examples:
            | event_name      | start  | end    | group  |
            | interview       | Tue 13 | Tue 13 | Room C |
            | interview       | Tue 13 | Tue 13 |        |
            | meeting         | Tue 13 | Tue 13 | Room A |

    @groups @drag_and_drop @month
    Scenario Outline: Dragging and dropping events when showing groups in month view
        When I open the "index" page
        And I click on "month"
        And I click on "show groups"
        When I drag the "<event_name>" event to "<start>" in "<group>" group
        Then the "<event_name>" event should be displayed from "<start>" to "<end>" in "<group>" group

        Examples:
            | event_name      | start | end  | group  |
            | interview       | T 13  | T 13 | Room C |
            | interview       | T 13  | T 13 |        |
            | meeting         | T 13  | T 13 | Room A |

    @groups @drag_and_drop @year
    Scenario Outline: Dragging and dropping events when showing groups in year view
        When I open the "index" page
        And I click on "year"
        And I click on "show groups"
        When I drag the "<event_name>" event to "<start>" in "<group>" group
        Then the "<event_name>" event should be displayed from "<start>" to "<end>" in "<group>" group

        Examples:
            | event_name      | start | end  | group  |
            | interview       | Aug   | Aug  | Room C |
            | interview       | Aug   | Aug  |        |
            | meeting         | Aug   | Aug  | Room A |

    @groups @drag_and_drop @day @wip
    Scenario Outline: Dragging and dropping events when showing groups in day view
        When I open the "index" page
        And I click on "day"
        And I click on "show groups"
        When I drag the "<event_name>" event to "<start>" in "<group>" group
        Then the "<event_name>" event should be displayed from "<start>" to "<end>" in "<group>" group

        Examples:
            | event_name       | start | end   | group  |
            | interview        | 12:00 | 12:00 | Room C |
            | interview        | 12:00 | 12:00 |        |
            | medical checkup  | 12:00 | 12:00 | Room B |

    @groups @drag_and_drop
    Scenario: When dragging an event in classic display, the group of the event should remain unchanged
        When I open the "index" page
        And I click on "month"
        And  I drag the "interview" event to day 8
        And I click on "show groups"
        Then the "interview" event should be displayed from "8" to "8" in "Room B" group

    Rule: Browsing dates in day view
        Background:
            When I open the "index" page
            And I click on "day"

        Example:
            Then I should see "Tuesday, August 13, 2024"
            
        Example:
            When I click on ">"
            Then I should see "Wednesday, August 14, 2024"

        Example:
            When I click on ">"
            And I click on "today"
            Then I should see "Tuesday, August 13, 2024"

        Example:
            When I click on "<"
            Then I should see "Monday, August 12, 2024"

    Rule: Browsing dates in week view
        Background:
            When I open the "index" page            

        Example: 
            Then I should see "Aug 12, 2024 - Aug 18, 2024"

        Example: 
            When I click on ">"
            Then I should see "Aug 19, 2024 - Aug 25, 2024"

        Example: 
            When I click on "<"
            Then I should see "Aug 5, 2024 - Aug 11, 2024"

        Example:
            When I click on ">"
            When I click on "today"
            Then I should see "Aug 12, 2024 - Aug 18, 2024"
        
    Rule: Browsing dates in month view
        Background:
            When I open the "index" page
            And I click on "month"

        Example:
            Then I should see "August 2024"

        Example:
            When I click on ">"
            Then I should see "September 2024"

        Example:
            When I click on "<"
            Then I should see "July 2024"

        Example:
            When I click on ">"
            And I click on "today"
            Then I should see "August 2024"

    @year
    Rule: Browsing dates in year view
        Background:
            When I open the "index" page
            And I click on "year"

        Example:
            Then I should see "2024"

        Example:
            When I click on ">"
            Then I should see "2025"

        Example:
            When I click on "<"
            Then I should see "2023"

        Example:
            When I click on ">"
            And I click on "today"
            Then I should see "2024"
