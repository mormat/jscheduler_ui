@example
Feature: examples page

    Background:
        Given today is "2023-05-04" 
        When I open the "examples" page

    Scenario: Week view - Init scheduler
        When I select the "Init scheduler" example in "Week view"
        Then the scheduler should be in week view
        And I should see :
            | Mon, May 1 Tue, May 2 |
            | Sat, May 6 Sun, May 7 |
            | 08:00 |
            | 19:00 |
            
    Scenario: Week view - Displaying events
        When I select the "Displaying events" example in "Week view"
        Then the 'interview' event should be displayed at "Tue, Aug 13" from '10:00' to '12:00'
        And the 'meeting' event should be displayed at "Thu, Aug 15" from '14:00' to '18:00'
        And the "training course" event should be displayed from "Thu, Aug 15" to "Sat, Aug 17"
        And I should not see "undefined"

    @ajax
    Scenario: Week view - Loading events with ajax
        When I select the "Loading events with ajax" example in "Week view"
        And I wait until I see "meeting"
        Then the 'meeting' event should be displayed at "Thu, Aug 15" from '14:00' to '16:00'
        And "./examples/events.json" should be loaded from "2024-08-12 00:00:00.000" to "2024-08-18 23:59:59.999"

    @i18n
    Scenario: Week view - i18n
        When I select the "i18n" example in "Week view"
        Then I should see "1 mag 2023 - 7 mag 2023"
        And I should see :
            | lun 1 mag |
            | mar 2 mag |
            | mer 3 mag |
            | gio 4 mag |
            | ven 5 mag |
            | sab 6 mag |
            | dom 7 mag |
        And I should see a "Modifica l'evento" tooltip

    Scenario: Week view - Custom hours range
        When I select the "Custom hours range" example in "Week view"
        Then I should see :
            | 09:00 |
            | 18:00 |
        And I should not see :
            | 08:00 |
            | 19:00 |
               
    Scenario Outline: Week view - Click on events
        When I select the "Click on events" example in "Week view"
        And I click on the "<eventName>" event
        Then I should see "clicked on <eventName>"

    Examples:
        | eventName       |
        | presentation    |
        | training course |

    @drag_and_drop
    Scenario Outline: Week view - Drag and drop events
        When I select the "Drag and drop events" example in "Week view"
        And I drag the "<eventName>" event to <dropTarget>
        Then the '<eventName>' event should be displayed <expectedDisplay>
        And I should see "<eventName> event dropped"
        And I should see "<expectedComment>"
        
    Examples:
        | eventName       | dropTarget              | expectedDisplay                         | expectedComment                                  |
        | presentation    | "Wed, Oct 2" at "09:00" | at "Wed, Oct 2" from '09:00' to '13:00' | at (Wed Oct 02 2024 09:00,Wed Oct 02 2024 13:00) |
        | training course | "Fri, Oct 4"            | from "Fri, Oct 4" to "Sat, Oct 5"       | at (Fri Oct 04 2024 08:00,Sat Oct 05 2024 19:00) |

    @drag_and_drop
    Scenario: Week view - Resize events
        When I select the "Resize events" example in "Week view"
        And I resize the "presentation" event to "16:00"
        Then the "presentation" event should be displayed at "Thu, Oct 3" from "09:00" to "16:00"
        And I should see "presentation event resized to 16:00"

    @week @groups
    Scenario: Week view - Showing groups
        When I select the "Showing groups" example in "Week view"
        Then I should see "Mon 1 Tue 2 Wed 3 Thu 4 Fri 5 Sat 6 Sun 7"
        And I should see :
            | Maria Penny |
            | John Castillo |
            | Kate Dillard |
            | Scott Peacock |
        And the "some task" event should be displayed from "Tue 2" to "Tue 2" in "John Castillo" group
        And the "another task" event should be displayed from "Tue 2" to "Wed 3" in "Kate Dillard" group
        And the "ungrouped task" event should be displayed from "Wed 3" to "Fri 5" in "missing-group" group

    Scenario: Month view - Init scheduler
        When I select the "Init scheduler" example in "Month view"
        Then the scheduler should be in month view
        And I should see :
            | Mon Tue Wed Thu Fri Sat Sun |
            | 1 2 3 4 5 6 7    |
            | 29 30 31 |

    Scenario: Month view - Displaying events
        When I select the "Displaying events" example in "Month view"
        Then the "training course" event should be displayed from day 1 to day 2
        And the "presentation (1)" event should be displayed from day 5 to day 6
        And the "presentation (2)" event should be displayed from day 7 to day 8
        And I should not see "undefined"

    @ajax
    Scenario: Month view - Loading events with ajax
        When I select the "Loading events with ajax" example in "Month view"
        And I wait until I see "meeting"
        Then the 'meeting' event should be displayed from day 15 to day 15
        And "./examples/events.json" should be loaded from "2024-07-29 00:00:00.000" to "2024-09-01 23:59:59.999"

    @drag_and_drop
    Scenario: Month view - Drag and drop events
        When I select the "Drag and drop events" example in "Month view"
        And I drag the "presentation" event to day 8
        Then the "presentation" event should be displayed from day 8 to day 11
        When I drag the "presentation" event to day 12
        Then the "presentation (1)" event should be displayed from day 12 to day 13
        And the "presentation (2)" event should be displayed from day 14 to day 15

    @i18n
    Scenario: Month view - i18n
        When I select the "i18n" example in "Month view"
        Then I should see "maggio 2023"
        And I should see "lun mar mer gio ven sab dom"
        And I should see a "Modifica l'evento" tooltip

    @month @groups
    Scenario: Month view - Showing groups
        When I select the "Showing groups" example in "Month view"
        Then I should see "W 31 T 1 F 2 S 3"
        And I should see "T 29 F 1"
        And I should see :
            | Maria Penny |
            | John Castillo |
            | Kate Dillard |
            | Scott Peacock |
        And the "some task" event should be displayed from "S 4" to "T 8" in "John Castillo" group

    @crud
    Scenario: CRUD operations - Creating an event
        When I select the "Creating an event" example in "CRUD operations"
        Then the "meeting" event should be displayed at "Tue, Sep 17" from "10:00" to "12:00"

    @crud @edit
    Scenario: CRUD operations - Updating an event
        When I select the "Updating an event" example in "CRUD operations"
        And I edit the "some task" event
        Then the "some task" event should not be displayed
        And the "some updated task" event should be displayed at "Tue, Sep 17" from "14:00" to "16:00"
        And I should see "another task"

    @crud
    Scenario: CRUD operations - Deleting an event
        When I select the "Deleting an event" example in "CRUD operations"
        And I click on the "some task" event
        Then the "some task" event should not be displayed
        And I should see "another task"

    @responsive
    Scenario Outline: Responsive breakpoint
        When I select the "Responsive rendering" example in "Misc"
        And I click on "<text_button>"
        Then the page should contains an '<css_selector>' element

    Examples:
        | text_button    | css_selector                             |
        | small          | .jscheduler_ui[data-breakpoint="small"]  |
        | medium         | .jscheduler_ui[data-breakpoint="medium"] |
        | large          | .jscheduler_ui[data-breakpoint="large"]  |

    @responsive
    Scenario: Default breakpoint should be defined
        When I select the "Responsive rendering" example in "Misc"
        Then the page should contains an '.jscheduler_ui[data-breakpoint]' element

    @year
    Scenario: Year view - Init scheduler
        When I select the "Init scheduler" example in "Year view"
        Then I should see : 
            | January   |
            | February  |
            | March     |
            | April     |
            | May       |
            | June      |
            | August    |
            | September |
            | October   |
            | November  |
            | December  |
        And I should see "M T W T F S S M T W T F S S"

    @year
    Scenario: Year view - Displaying events
        When I select the "Displaying events" example in "Year view"
        Then the "task 1" event should be displayed between day 5 and day 7 in the month of "January"
        And the "t2" event should be displayed between day 10 and day 10 in the month of "March"

    @year
    Scenario: Year view - Loading events with ajax
        When I select the "Loading events with ajax" example in "Year view"
        And I wait until I see "meeting"
        Then the "meeting" event should be displayed between day 15 and day 15 in the month of "August"
        And "./examples/events.json" should be loaded from "2024-01-01 00:00:00.000" to "2024-12-31 23:59:59.999"

    @year
    Scenario: Year view - Drag and drop events
        When I select the "Drag and drop events" example in "Year view"
        And I drag the "task 1" event to day 12 in the month of "February"
        Then the "task 1" event should be displayed between day 12 and day 14 in the month of "February"

    @year 
    Scenario: Year view - Drag and drop events
        When I select the "i18n" example in "Year view"
        Then I should see : 
            | Janvier   |
            | Février   |
            | Mars      |
            | Avril     |
            | Mai       |
            | Juin      |
            | Juillet   |
            | Août      |
            | Septembre |
            | Octobre   |
            | Novembre  |
            | Décembre  |
        And I should see "L M M J V S D"

    @year @groups
    Scenario: Year view - Showing groups
        When I select the "Showing groups" example in "Year view"
        Then I should see "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"
        And I should see :
            | Maria Penny |
            | John Castillo |
            | Kate Dillard |
            | Scott Peacock |
        And the "some task" event should be displayed from "Feb" to "Feb" in "John Castillo" group
        And the "long task" event should be displayed from "Apr" to "Aug" in "Kate Dillard" group

    @day @groups
    Scenario: Day view - Showing groups
        When I select the "Showing groups" example in "Day view"
        Then I should see "00:00 02:00 04:00 06:00"
        And I should see "18:00 20:00 22:00"
        And I should see :
            | Maria Penny |
            | John Castillo |
            | Kate Dillard |
            | Scott Peacock |
        And the "some task" event should be displayed from "10:00" to "12:00" in "John Castillo" group
