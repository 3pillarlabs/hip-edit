# hip-edit

A serverless collaborative editor.

## Component Architecture

```
                /----> [ Cache ]
                |
                |
[Source] ---> [API] ---> [ Message Queue] -(stomp)--> [Source]
               ^
               |
[Source] _____/  (fetch-contents)
```

Event:
- Source Hash
- Event Type - :text_change/ :cursor_moved
- Name
- Initials
- Row Number
- Column Number
- Row Text
- Timestamp: Milliseconds since Epoch (UTC)
- Commit Hash

## Deployment Architecture

```
                                   /----> [ Redis Cache ]
                                   |
                                   |
[Editor] ---> [API Gateway] ---> [Lambda] ---> [Apache MQ] --(stomp)--> [Editor]
               ^
               |
[Editor] _____/  (fetch-contents)
```
