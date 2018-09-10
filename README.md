# hip-edit

A serverless collaborative editor. _Serverless_ in this context means no servers _to manage_.

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

## Project Hierarchy

There are 3 sub-projects with their own README -

* hip-edit-server - API
* hip-edit-web - SPA
* deployment - AWS CloudFormation and SAM
