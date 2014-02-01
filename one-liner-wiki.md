####Connect
```javascript
var db = require('jsondb')

db.connect('my_database_name', fn)
```

```

####Database
```javascript
//create
db.connect('my_database_name', fn)

//read
var json = db.getJSON(fn)

//update @see ROADMAP.md

//delete
db.delete('my_database_name', fn)
```

####Table
```javascript
//create
db.create('table', 'my_table_name', fn)

//read @see ROADMAP.md

//update
db.update('table', {set: ["old_name","new_name"]}, fn)

//delete
db.delete('table', 'my_table_name', fn)

```

####Row
```javascript
//create
db.insert(tblname, ["value 1", "value 2", "value 3"], fn)

//read
var query = [
	{where: ["id", "123456"]},
	{where: ["name", "Daithi Coombes"]}
]
db.query("my_table_name", query, fn)

//update
var query = {
	table: tblname,
	data: {
		where: ["field_1", "val4"],
		set: ["field_1", "new val"]
	}
}
db.update('row', query, fn)

//delete
db.delete('row', {table: tblname, where: ["col_name", "val"]}, fn)

```

####Col
```javascript

```