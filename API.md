I"m imagining that the backend API/endpoints will look like:

_Configuration_

```
GET /team/all/[team_id]
response body example:
[
	{ id: "SampleUser0", role: "TRUSTED", "trusted_by": "SampleStreamer0" },
	{ id: "SampleUser1", role: "TRUSTED", "trusted_by": "SampleStreamer1" }
]

POST /team/[team_id]
request body example:
{
	"user": "SampleUser1",
	"role": "TRUSTED",
	"truster": "SampleStreamer1"
}

response:
"Success"
```

_Viewer Panel_

```
GET /team/[user_id]?stream_id={streamid}

response body example:
{
	"role":"TRUSTED"
}
```

_Team Management_
```
GET /user/[user_id]

response body example:
{
	"team_id":"TEST_TEAM|empty"
}

POST /user/[user_id]
request body example:
{
	"team_id": "TEST_TEAM"
}

response:
"Success"
```
