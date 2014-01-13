node-jsondb
===========

An, extremely, light and portable CRUD json based database

use case
========

Only use when very little data needs to be stored and your app needs to be
portable. Helps in situations where setting up mongodb or other db and drivers
is overkill or unfeasable

Usage
=====
```
var db = require('jsondb')
db.connect('my_database_name', fn)
```

Setup
-----
```
//change storage location (path to where database json files are stored)
db.getDB().storage('/path/to/directory')
```

Create
------
```
var db = require('jsondb')

//Will create or load `my_database.json` in current working directory
db = require('jsondb').connect('my_database')

//connect or create a database
db.connect('my_database', fn)

//create table
db.create('table', 'my_table_name', fn)

//create col
db.create('col', {table:tblname, col:col}, fn)

//insert row - note the index of these must match the index of database.tables[tblname].fields
db.insert(tblname, ["value 1", "value 2", "value 3"], fn)
```

Read
----
```
var db = require('jsondb')

//get database json
var json = db.getJSON(fn)

//query database:
//the query format is [{where: [col, val]}]
var query = [
	{where: ["id", "123456"]},
	{where: ["name", "Daithi Coombes"]}
]
db.query("my_table_name", query, fn)
```

Update
------
```
var db = require('jsondb')

//update a row
var query = {
	table: tblname,
	data: {
		where: ["field_1", "val4"],
		set: ["field_1", "new val"]
	}
}
db.update('row', query, fn)

//update a col name. NB Column names can only conatin a-zA-Z0-9 and underscore,
//also the must start with a letter.
var query = {
	table: tblname,
	set: ["old_col_name", "new_col_name"]
}
db.update('col', query, fn)

//update table name
db.update('table', {set: ["old_name","new_name"]}, fn)
```

Delete
------
```
//delete database
db.delete('my_database', fn)

//delete table
db.delete('table', 'my_table_name', fn)

//delete row
db.delete('row', {table: tblname, where: ["col_name", "val"]}, fn)

//delete col
db.delete('col', {table:tblname, col:col}, fn)
```
