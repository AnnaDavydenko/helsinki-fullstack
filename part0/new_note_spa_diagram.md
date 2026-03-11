# Exercise 0.6: New Note in Single Page App Diagram

Sequence diagram depicting the situation where the user creates a new note using the single-page version of the app at `https://studies.cs.helsinki.fi/exampleapp/spa`.

```mermaid
sequenceDiagram
    participant browser
    participant server

    Note right of browser: The user types in the text field and clicks "Save"
    Note right of browser: The browser's JS event handler prevents the default form submit
    Note right of browser: It creates a new note, adds it to the local array, and redraws the UI

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    activate server
    Note left of server: The payload is sent as JSON: { content: "...", date: "..." }
    Note left of server: The server saves the new note to its array
    server-->>browser: 201 Created
    deactivate server

    Note right of browser: The browser does not reload the page or fetch new data
```
